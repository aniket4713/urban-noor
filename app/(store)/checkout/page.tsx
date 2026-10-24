"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, MapPin, Plus, Tag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { loadRazorpay } from "@/components/checkout/loadRazorpay";
import { api } from "@/lib/fetcher";
import { checkoutSchema } from "@/lib/validators";
import { cn, formatINR, INDIAN_STATES } from "@/lib/utils";

type Address = { id: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };
type Quote = { subtotal: number; shippingFee: number; discount: number; total: number; couponCode: string | null };
type CreateOrderRes = {
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  customer: { name: string; email: string; contact: string };
};

const emptyAddress = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const { items, ready, clear } = useCart();
  // Stable key: the cart object changes identity on every sync, but we only re-quote when contents change
  const linesKey = JSON.stringify(items.filter((i) => i.product).map(({ productId, quantity }) => ({ productId, quantity })));
  const lines = useMemo(() => JSON.parse(linesKey) as { productId: string; quantity: number }[], [linesKey]);

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState(emptyAddress);
  const [saved, setSaved] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [applying, setApplying] = useState(false);
  const lastOrder = useRef<{ sig: string; data: CreateOrderRes } | null>(null);

  // prefill for logged-in customers
  useEffect(() => {
    if (!user) return;
    setCustomer((c) => ({ name: c.name || user.name, email: c.email || user.email, phone: c.phone || user.phone || "" }));
    api<{ addresses: Address[] }>("/api/account/addresses")
      .then(({ addresses }) => {
        setSaved(addresses);
        const def = addresses.find((a) => a.isDefault) || addresses[0];
        if (def) setSelectedId(def.id);
      })
      .catch(() => {});
  }, [user]);

  // server-side totals (prices, shipping, coupon) — recalculated when cart or coupon changes
  const refreshQuote = useCallback(
    async (code: string) => {
      if (!lines.length) return;
      try {
        const q = await api<Quote>("/api/checkout/quote", { body: { items: lines, couponCode: code || undefined } });
        setQuote(q);
        setQuoteError("");
        return true;
      } catch (e) {
        setQuoteError((e as Error).message);
        return false;
      }
    },
    [lines]
  );

  // debounced so quick quantity changes trigger one request, not several
  useEffect(() => {
    const t = setTimeout(() => {
      refreshQuote(coupon).then((ok) => {
        if (ok === false && coupon) setCoupon(""); // invalid coupon → effect re-runs without it
      });
    }, 300);
    return () => clearTimeout(t);
  }, [refreshQuote, coupon]);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    const ok = await refreshQuote(code);
    setApplying(false);
    if (ok) {
      setCoupon(code); // quote already fetched above; the effect's re-fetch is cheap and keeps state in sync
      toast(`Coupon ${code} applied ✦`);
    }
  };

  const shipping = selectedId !== "new" ? saved.find((a) => a.id === selectedId) : null;
  const effectiveAddress = shipping
    ? { name: shipping.name, phone: shipping.phone, line1: shipping.line1, line2: shipping.line2 || "", city: shipping.city, state: shipping.state, pincode: shipping.pincode }
    : address;

  const pay = async () => {
    const payload = {
      items: lines,
      customer,
      address: effectiveAddress,
      couponCode: coupon || undefined,
      saveAddress: Boolean(user) && selectedId === "new" && saveAddress,
    };
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path.join(".")] = i.message;
      setErrors(errs);
      toast(parsed.error.issues[0]?.message || "Please check your details", "error");
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setPaying(true);

    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Could not load the payment window. Check your internet connection.");

      // Re-use the same pending order if nothing changed (e.g. customer closed the popup and retried)
      const sig = JSON.stringify(parsed.data);
      let order = lastOrder.current?.sig === sig ? lastOrder.current.data : null;
      if (!order) {
        order = await api<CreateOrderRes>("/api/payments/create-order", { body: parsed.data });
        lastOrder.current = { sig, data: order };
      }

      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Urban Noor",
        description: `Order ${order.orderNumber}`,
        image: `${window.location.origin}/favicon.svg`,
        order_id: order.razorpayOrderId,
        prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.contact },
        notes: { orderNumber: order.orderNumber },
        theme: { color: "#C2186B" },
        handler: async (res) => {
          try {
            const v = await api<{ orderNumber: string }>("/api/payments/verify", { body: res });
            clear();
            lastOrder.current = null;
            router.push(`/order-success/${v.orderNumber}`);
          } catch (e) {
            toast((e as Error).message, "error");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled — your bag is saved. Try again anytime.", "info");
          },
        },
      });
      rzp.on("payment.failed", (r) => {
        toast(r.error.description || "Payment failed. Please try another method.", "error");
      });
      rzp.open();
    } catch (e) {
      toast((e as Error).message, "error");
      setPaying(false);
    }
  };

  if (ready && lines.length === 0) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl">Nothing to check out</h1>
        <p className="mt-3 text-ivory/55">Your bag is empty.</p>
        <Link href="/shop" className="btn-gold mt-8">Continue shopping</Link>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <div className="container-x py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Secure checkout</p>
          <h1 className="font-display text-5xl">Checkout</h1>
        </div>
        {!authLoading && !user && (
          <p className="text-sm text-ivory/60">
            Have an account?{" "}
            <Link href="/login?next=/checkout" className="text-gold underline-offset-4 hover:underline">Log in</Link> — or continue as guest below.
          </p>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Contact */}
          <Section step={1} title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={err("customer.name")} className="sm:col-span-2">
                <input className="input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Email" error={err("customer.email")}>
                <input className="input" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} autoComplete="email" />
              </Field>
              <Field label="Mobile number" error={err("customer.phone")}>
                <div className="flex">
                  <span className="flex items-center rounded-l-xl border border-r-0 border-ivory/10 bg-noir-700 px-3 text-sm text-ivory/50">+91</span>
                  <input className="input rounded-l-none" inputMode="numeric" maxLength={10} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "") })} autoComplete="tel-national" />
                </div>
              </Field>
            </div>
            <p className="mt-3 text-xs text-ivory/40">Order updates will be sent to this email.</p>
          </Section>

          {/* Address */}
          <Section step={2} title="Shipping address">
            {saved.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {saved.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={cn("relative rounded-2xl border p-4 text-left text-sm transition", selectedId === a.id ? "border-gold bg-gold/5" : "border-ivory/10 hover:border-gold/40")}
                  >
                    {selectedId === a.id && <Check className="absolute right-3 top-3 h-4 w-4 text-gold" />}
                    <p className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-gold" />{a.name}</p>
                    <p className="mt-1 text-ivory/55">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} – {a.pincode}</p>
                    <p className="text-ivory/55">{a.phone}</p>
                  </button>
                ))}
                <button onClick={() => setSelectedId("new")} className={cn("flex items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm transition", selectedId === "new" ? "border-gold text-gold" : "border-ivory/15 text-ivory/60 hover:border-gold/40")}>
                  <Plus className="h-4 w-4" /> New address
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {selectedId === "new" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Recipient name" error={err("address.name")}>
                      <input className="input" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                    </Field>
                    <Field label="Recipient mobile" error={err("address.phone")}>
                      <input className="input" inputMode="numeric" maxLength={10} value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })} />
                    </Field>
                    <Field label="House / flat, street" error={err("address.line1")} className="sm:col-span-2">
                      <input className="input" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} autoComplete="address-line1" />
                    </Field>
                    <Field label="Area, landmark (optional)" error={err("address.line2")} className="sm:col-span-2">
                      <input className="input" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} autoComplete="address-line2" />
                    </Field>
                    <Field label="City" error={err("address.city")}>
                      <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} autoComplete="address-level2" />
                    </Field>
                    <Field label="PIN code" error={err("address.pincode")}>
                      <input className="input" inputMode="numeric" maxLength={6} value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })} autoComplete="postal-code" />
                    </Field>
                    <Field label="State" error={err("address.state")} className="sm:col-span-2">
                      <select className="input" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {user && (
                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-ivory/70">
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-[#C2186B]" />
                      Save this address to my account
                    </label>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-5 lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="mb-5 font-display text-2xl">Order summary</h2>
            <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.filter((i) => i.product).map((i) => (
                <li key={i.productId} className="flex gap-3">
                  <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-noir-700">
                    <img src={i.product!.image || "/seed/hero.jpg"} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i.quantity}</span>
                  </div>
                  <span className="flex-1 text-sm leading-snug">{i.product!.name}</span>
                  <span className="text-sm">{formatINR(i.product!.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="my-5 divider-gold" />

            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-gold"><Tag className="h-4 w-4" /> {coupon} applied</span>
                <button onClick={() => { setCoupon(""); setCouponInput(""); }} aria-label="Remove coupon"><X className="h-4 w-4 text-ivory/60 hover:text-red-600" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code" className="input py-2.5" onKeyDown={(e) => e.key === "Enter" && applyCoupon()} />
                <button onClick={applyCoupon} disabled={applying} className="btn-outline px-4 py-2">{applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</button>
              </div>
            )}
            {quoteError && <p className="mt-2 text-xs text-red-600">{quoteError}</p>}

            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Subtotal" value={quote ? formatINR(quote.subtotal) : "…"} />
              <Row label="Shipping" value={quote ? (quote.shippingFee ? formatINR(quote.shippingFee) : "Free") : "…"} />
              {quote && quote.discount > 0 && <Row label="Discount" value={`−${formatINR(quote.discount)}`} highlight />}
              <div className="divider-gold my-3" />
              <div className="flex items-baseline justify-between">
                <dt className="font-display text-xl">Total</dt>
                <motion.dd key={quote?.total} initial={{ scale: 1.15, color: "#7B2FBE" }} animate={{ scale: 1, color: "#C2186B" }} className="text-2xl font-semibold">
                  {quote ? formatINR(quote.total) : "…"}
                </motion.dd>
              </div>
            </dl>

            <motion.button whileTap={{ scale: 0.98 }} onClick={pay} disabled={paying || !quote} className="btn-gold mt-6 w-full py-4 text-base">
              {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
              {paying ? "Opening secure payment…" : `Pay ${quote ? formatINR(quote.total) : ""}`}
            </motion.button>
            <p className="mt-3 text-center text-xs text-ivory/40">UPI · Cards · Netbanking · Wallets — secured by Razorpay</p>
          </div>
          <p className="px-2 text-center text-xs text-ivory/40">
            By placing your order you agree to our <Link href="/policies/terms" className="underline">Terms</Link> and{" "}
            <Link href="/policies/returns" className="underline">Return Policy</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: step * 0.1 }} className="card p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-sm text-gold">{step}</span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className} data-error={error ? "true" : undefined}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ivory/60">{label}</dt>
      <dd className={highlight ? "text-emerald-700" : ""}>{value}</dd>
    </div>
  );
}
