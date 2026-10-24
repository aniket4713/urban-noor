import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SuccessBurst } from "@/components/checkout/SuccessBurst";
import { orderService } from "@/lib/services/orderService";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const order = await orderService.getByNumber(params.orderNumber.toUpperCase());
  if (!order) notFound();
  const confirmed = order.status !== "PENDING" && order.status !== "CANCELLED";

  return (
    <div className="container-x max-w-2xl py-20 text-center">
      <SuccessBurst />
      <p className="eyebrow mt-10">Order {order.orderNumber}</p>
      <h1 className="mt-3 font-display text-5xl">{confirmed ? "Thank you for shopping!" : "Confirming your payment…"}</h1>
      <p className="mx-auto mt-4 max-w-md text-ivory/60">
        {confirmed
          ? `A confirmation has been sent to ${order.email}. We'll let you know as soon as your sparkle ships.`
          : "We're waiting for the bank to confirm. This usually takes a few seconds — refresh this page shortly."}
      </p>

      <div className="card mt-10 p-6 text-left">
        <ul className="divide-y divide-ivory/10">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 py-3">
              <img src={i.image || "/seed/hero.jpg"} alt="" className="h-14 w-12 rounded-lg object-cover" />
              <span className="flex-1 text-sm">
                {i.name} <span className="text-ivory/40">× {i.quantity}</span>
              </span>
              <span className="text-sm">{formatINR(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="divider-gold my-4" />
        <div className="flex justify-between font-display text-xl">
          <span>Total paid</span>
          <span className="text-gold">{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={`/track-order?order=${order.orderNumber}`} className="btn-outline">Track order</Link>
        <Link href="/shop" className="btn-gold">Continue shopping</Link>
      </div>
    </div>
  );
}
