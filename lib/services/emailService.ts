import { Resend } from "resend";
import {
  adminNewOrderEmail,
  orderConfirmationEmail,
  orderStatusEmail,
  passwordResetEmail,
  welcomeEmail,
} from "@/emails/templates";

let resend: Resend | null = null;

/**
 * Send an email with Resend. If RESEND_API_KEY is not set (local dev),
 * the email is printed to the terminal instead so you can still test flows.
 * Email failures never break checkout — they are logged and swallowed.
 */
async function send(to: string, mail: { subject: string; html: string }) {
  const from = process.env.EMAIL_FROM || "Urban Noor <onboarding@resend.dev>";
  if (!process.env.RESEND_API_KEY) {
    const preview = mail.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400);
    console.log(`\n📧 [DEV EMAIL] to=${to}\n   subject: ${mail.subject}\n   ${preview}\n`);
    return;
  }
  try {
    resend ??= new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from, to, subject: mail.subject, html: mail.html });
    if (error) console.error("[EMAIL ERROR]", error);
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
  }
}

type FullOrder = Parameters<typeof adminNewOrderEmail>[0];

export const emailService = {
  async orderPlaced(order: FullOrder) {
    await Promise.all([
      send(order.email, orderConfirmationEmail(order)),
      send(process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || order.email, adminNewOrderEmail(order)),
    ]);
  },
  async orderStatusChanged(order: FullOrder, status: string) {
    const mail = orderStatusEmail(order, status);
    if (mail) await send(order.email, mail);
  },
  async passwordReset(to: string, name: string, link: string) {
    await send(to, passwordResetEmail(name, link));
  },
  async welcome(to: string, name: string) {
    await send(to, welcomeEmail(name));
  },
};
