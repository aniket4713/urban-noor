import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Store policy pages. Razorpay asks for these (Shipping, Refunds, Privacy, Terms, Contact)
 * before activating live payments. ⚠ Replace the placeholder text with your own business details
 * (legal name, address, timelines) before going live.
 */
const POLICIES: Record<string, { title: string; body: React.ReactNode }> = {
  shipping: {
    title: "Shipping Policy",
    body: (
      <>
        <h2>Processing time</h2>
        <p>All orders are processed and dispatched within 1–2 business days of payment confirmation.</p>
        <h2>Delivery time</h2>
        <ul>
          <li>Metro cities: 3–5 business days</li>
          <li>Rest of India: 5–7 business days</li>
          <li>Remote areas / North-East: up to 10 business days</li>
        </ul>
        <h2>Shipping charges</h2>
        <p>Free shipping on orders above ₹999. A flat shipping fee applies to smaller orders, shown at checkout before payment.</p>
        <h2>Tracking</h2>
        <p>Once your order ships, you&apos;ll receive an email with the courier name and tracking number. You can also track it on our Track Order page.</p>
        <h2>Delays</h2>
        <p>Delivery timelines are estimates. Delays caused by couriers, weather or public holidays are outside our control, but we&apos;ll always help you follow up.</p>
      </>
    ),
  },
  returns: {
    title: "Return & Refund Policy",
    body: (
      <>
        <h2>7-day returns</h2>
        <p>If you&apos;re not happy with your purchase, you can request a return within 7 days of delivery. Items must be unused, undamaged and in their original packaging with tags.</p>
        <h2>Non-returnable items</h2>
        <ul>
          <li>Earrings and nose pins (for hygiene reasons), unless received damaged</li>
          <li>Items bought on clearance sale</li>
          <li>Customised products</li>
        </ul>
        <h2>Damaged or wrong item</h2>
        <p>If you receive a damaged or incorrect item, email us within 48 hours of delivery with an unboxing photo or video and we&apos;ll replace it at no cost.</p>
        <h2>Refunds</h2>
        <p>Once your return is received and inspected, refunds are processed to the original payment method within 5–7 business days. Shipping charges are non-refundable.</p>
        <h2>Cancellations</h2>
        <p>Orders can be cancelled before they are shipped. Contact us as soon as possible with your order number.</p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <p>This policy explains how Urban Noor collects and uses your personal information when you shop with us.</p>
        <h2>Information we collect</h2>
        <ul>
          <li>Contact details: name, email, phone number</li>
          <li>Shipping address</li>
          <li>Order history and wishlist (if you create an account)</li>
        </ul>
        <h2>Payments</h2>
        <p>Payments are processed securely by Razorpay. We never see or store your card, UPI or bank details.</p>
        <h2>How we use it</h2>
        <p>To process and deliver your orders, send order updates, provide customer support and — only if you subscribe — share offers. You can unsubscribe anytime.</p>
        <h2>Sharing</h2>
        <p>We share only what&apos;s necessary with delivery partners and payment processors. We never sell your data.</p>
        <h2>Contact</h2>
        <p>For privacy questions or to delete your data, contact us using the details on our Contact page.</p>
      </>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    body: (
      <>
        <p>By using this website and placing an order, you agree to the following terms.</p>
        <h2>Products</h2>
        <p>All products are artificial / imitation jewellery. Colours may vary slightly due to photography and screen settings.</p>
        <h2>Pricing</h2>
        <p>All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the right to change prices without notice; the price at the time of order applies.</p>
        <h2>Orders</h2>
        <p>An order is confirmed only after successful payment. We may cancel orders in case of stock errors or suspected fraud, with a full refund.</p>
        <h2>Liability</h2>
        <p>Our liability is limited to the value of the product purchased.</p>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India. Disputes are subject to the jurisdiction of courts in our registered city.</p>
      </>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return { title: POLICIES[params.slug]?.title ?? "Policy" };
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();
  return (
    <div className="container-x max-w-3xl py-16">
      <p className="eyebrow mb-3">Policies</p>
      <h1 className="font-display text-5xl">{policy.title}</h1>
      <p className="mt-2 text-xs text-ivory/40">Last updated: {new Date().getFullYear()}</p>
      <div className="prose-policy mt-8">{policy.body}</div>
    </div>
  );
}
