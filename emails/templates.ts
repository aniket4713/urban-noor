// Branded black-and-gold HTML email templates (inline styles for email client compatibility).
import { formatINR, siteUrl } from "@/lib/utils";

type OrderForEmail = {
  orderNumber: string;
  customerName: string;
  shipName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  courier?: string | null;
  trackingNumber?: string | null;
  items: { name: string; price: number; quantity: number; image?: string | null }[];
};

const GOLD = "#C9A24D";

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4efe6;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">
    <tr><td style="background:#0B0B0C;padding:28px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:28px;letter-spacing:6px;color:${GOLD}">URBAN NOOR</div>
      <div style="font-size:11px;letter-spacing:3px;color:#bfae86;margin-top:6px">SHINE WITHOUT LIMITS</div>
    </td></tr>
    <tr><td style="padding:32px 32px 8px">
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px">${title}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:24px 32px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee">
      Need help? Just reply to this email.<br/>
      <a href="${siteUrl()}" style="color:${GOLD};text-decoration:none">${siteUrl().replace(/^https?:\/\//, "")}</a>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:#0B0B0C;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:14px;margin:12px 0">${label}</a>`;
}

function itemsTable(o: OrderForEmail) {
  const rows = o.items
    .map(
      (i) => `<tr>
      <td style="padding:8px 0;font-size:14px">${i.name} <span style="color:#888">× ${i.quantity}</span></td>
      <td style="padding:8px 0;font-size:14px;text-align:right">${formatINR(i.price * i.quantity)}</td></tr>`
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;font-size:14px;${bold ? "font-weight:bold" : "color:#555"}">${label}</td><td style="padding:4px 0;font-size:14px;text-align:right;${bold ? "font-weight:bold" : ""}">${value}</td></tr>`;
  return `<table width="100%" style="border-collapse:collapse;margin:16px 0">${rows}
    <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:8px"></td></tr>
    ${line("Subtotal", formatINR(o.subtotal))}
    ${line("Shipping", o.shippingFee ? formatINR(o.shippingFee) : "Free")}
    ${o.discount ? line("Discount", "−" + formatINR(o.discount)) : ""}
    ${line("Total paid", formatINR(o.total), true)}
  </table>`;
}

function addressBlock(o: OrderForEmail) {
  return `<p style="font-size:14px;color:#555;line-height:1.6;background:#faf7f0;padding:12px 16px;border-radius:8px">
    <strong style="color:#1a1a1a">Shipping to</strong><br/>${o.shipName}<br/>${o.line1}${o.line2 ? ", " + o.line2 : ""}<br/>${o.city}, ${o.state} – ${o.pincode}</p>`;
}

export function orderConfirmationEmail(o: OrderForEmail) {
  return {
    subject: `Order confirmed ✦ ${o.orderNumber}`,
    html: layout(
      `Thank you, ${o.customerName.split(" ")[0]}!`,
      `<p style="font-size:15px;line-height:1.6">Your order <strong>${o.orderNumber}</strong> is confirmed and our team is getting it ready with love. We'll email you again when it ships.</p>
      ${itemsTable(o)}${addressBlock(o)}
      ${button(`${siteUrl()}/track-order?order=${o.orderNumber}`, "Track your order")}`
    ),
  };
}

export function adminNewOrderEmail(o: OrderForEmail & { email: string; phone: string }) {
  return {
    subject: `🛍 New order ${o.orderNumber} — ${formatINR(o.total)}`,
    html: layout(
      "New order received",
      `<p style="font-size:15px">${o.customerName} · ${o.email} · ${o.phone}</p>${itemsTable(o)}${addressBlock(o)}
      ${button(`${siteUrl()}/admin/orders`, "Open in admin")}`
    ),
  };
}

export function orderStatusEmail(o: OrderForEmail, status: string) {
  const copy: Record<string, { title: string; text: string }> = {
    SHIPPED: {
      title: "Your sparkle is on its way ✦",
      text: `Good news! Order <strong>${o.orderNumber}</strong> has shipped${o.courier ? ` via <strong>${o.courier}</strong>` : ""}.${
        o.trackingNumber ? ` Tracking number: <strong>${o.trackingNumber}</strong>.` : ""
      }`,
    },
    DELIVERED: {
      title: "Delivered — wear it proud!",
      text: `Order <strong>${o.orderNumber}</strong> has been delivered. We hope you love it. Tag us on Instagram so we can see you shine!`,
    },
    CANCELLED: {
      title: "Your order was cancelled",
      text: `Order <strong>${o.orderNumber}</strong> has been cancelled. If you paid online, the refund will reach your original payment method in 5–7 working days.`,
    },
  };
  const c = copy[status];
  if (!c) return null;
  return {
    subject: `${c.title.replace(/<[^>]+>/g, "")} (${o.orderNumber})`,
    html: layout(c.title, `<p style="font-size:15px;line-height:1.6">${c.text}</p>${button(`${siteUrl()}/track-order?order=${o.orderNumber}`, "View order")}`),
  };
}

export function passwordResetEmail(name: string, link: string) {
  return {
    subject: "Reset your Urban Noor password",
    html: layout(
      `Hi ${name.split(" ")[0]},`,
      `<p style="font-size:15px;line-height:1.6">We received a request to reset your password. This link is valid for 30 minutes.</p>
      ${button(link, "Reset password")}
      <p style="font-size:13px;color:#888">If you didn't ask for this, you can safely ignore this email.</p>`
    ),
  };
}

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to Urban Noor ✦",
    html: layout(
      `Welcome, ${name.split(" ")[0]}!`,
      `<p style="font-size:15px;line-height:1.6">Your account is ready. Use code <strong>WELCOME100</strong> for ₹100 off your first order above ₹999.</p>
      ${button(`${siteUrl()}/shop`, "Start shopping")}`
    ),
  };
}
