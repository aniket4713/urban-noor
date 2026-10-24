# ✦ Urban Noor — Jewellery Store

Your own e-commerce store for artificial jewellery (men & women), replacing Shopify.

**Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Prisma · PostgreSQL on Supabase · Supabase Storage · Razorpay · Resend — one project, deploys to Vercel.

---

## What's inside

**Customer store**
- Light, luxurious cream design with gold, magenta and purple accents: hero with parallax & shimmering gold text, page transitions, staggered product reveals, hover image-swap with gold shine sweep, "fly-to-cart" animation, slide-in cart drawer, gallery with zoom & swipe
- Shop page with filters (Men/Women, category, price, in stock), sorting, pagination, live search suggestions
- Product pages with SEO metadata, Open Graph and Google product schema
- Cart saved in the browser for guests, synced to the account after login
- **Guest checkout** (name, email, phone, address — no account needed) or logged-in checkout with saved addresses
- Coupons, free-shipping progress bar, Razorpay payments (UPI, cards, netbanking, wallets)
- Accounts: register, login, forgot/reset password, orders with status timeline, addresses, wishlist, profile
- Guest order tracking (order number + email/phone)
- About, Contact, Shipping, Returns, Privacy, Terms pages (needed for Razorpay activation), WhatsApp button, animated 404, sitemap.xml, robots.txt

**Admin panel** (`/admin`)
- Dashboard: revenue, orders today, waiting-to-ship, customers, 30-day sales chart, low-stock alerts
- Products: list/search/filter, add, edit, delete, duplicate, multi-image upload with drag-to-reorder
- Categories, Orders (status, courier, tracking — customer is emailed automatically), Customers, Coupons
- Store settings: hero banner, announcement bar, shipping fee & free-shipping threshold, WhatsApp, contact & social links

---

## 1. Install the tools (once)

1. **Node.js 20 LTS** — https://nodejs.org (choose "LTS"). Check: open a terminal and run `node -v`
2. **Git** — https://git-scm.com
3. **VS Code** — https://code.visualstudio.com

## 2. Open the project

1. Unzip `urban-noor.zip`
2. VS Code → **File → Open Folder…** → choose the `urban-noor` folder
3. Accept the recommended extensions popup (Tailwind, Prisma, ESLint)
4. Open the terminal: **Terminal → New Terminal**

## 3. Create your free Supabase project (database + images)

1. Sign up at https://supabase.com → **New project**. Pick region **Mumbai (ap-south-1)**. Save the database password.
2. **Database connection strings:** click **Connect** (top bar) → **ORMs → Prisma**, or Project Settings → Database. You need two:
   - **Transaction pooler** (port **6543**) → this is `DATABASE_URL`. Add `?pgbouncer=true&connection_limit=5&pool_timeout=20` at the end.
   - **Session pooler / direct** (port **5432**) → this is `DIRECT_URL`.
   - Replace `[YOUR-PASSWORD]` with your database password.
3. **Image storage:** Storage → **New bucket** → name it `product-images` → turn **Public bucket ON** → Create.
4. **API keys:** Project Settings → API → copy the **Project URL** (`SUPABASE_URL`) and the **service_role** secret key (`SUPABASE_SERVICE_ROLE_KEY`). Keep the service role key secret — it's only used on the server.

## 4. Configure `.env`

In the VS Code terminal:

```bash
copy .env.example .env      # Windows (Command Prompt / PowerShell)
# cp .env.example .env      # macOS / Linux
```

Open `.env` and fill in the values. Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Razorpay and Resend can stay as placeholders for now — the store runs without them (emails print in the terminal; only the Pay button needs Razorpay).

## 5. Install, create tables, add sample data, run

```bash
npm install
npx prisma migrate dev --name init     # creates all tables in Supabase
npm run db:seed                        # admin user + 10 categories + 16 sample products + coupons
npm run dev
```

Open **http://localhost:3000** — the store. Open **http://localhost:3000/admin** — the admin panel.

**Default admin login** = `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (default `admin@urbannoor.in` / `Admin@12345`). **Change these before going live**, then run `npm run db:seed` again (it won't duplicate anything).

Sample coupons: `NOOR10` (10% off above ₹499, max ₹300) and `WELCOME100` (₹100 off above ₹999).

## 6. Set up Razorpay (test mode)

1. Sign up at https://dashboard.razorpay.com — you can use **Test Mode** immediately, before KYC.
2. Make sure the toggle at the top says **Test Mode** → Account & Settings → **API Keys** → Generate Key.
3. Put the values in `.env`:
   ```
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."   # same as RAZORPAY_KEY_ID
   ```
4. Restart `npm run dev` (Ctrl+C, then run it again — `.env` is only read at start-up).
5. Test a purchase: add to bag → Checkout (as guest) → Pay. In the Razorpay test popup, use UPI ID **`success@razorpay`** (or `failure@razorpay` to test a failed payment), or a test card from Razorpay's docs (search "Razorpay test card details").
6. You'll land on the order-success page; the order shows in **Admin → Orders** as **PAID** and stock is reduced.

**Webhooks** (needed in production, optional locally): Razorpay can't reach `localhost`, so set this up after deploying — see step 8.

### How the payment flow works (and why it's secure)
1. `/api/payments/create-order` recalculates the total **from the database** (never trusts browser prices), saves a PENDING order and creates a Razorpay order.
2. The Razorpay popup collects the payment.
3. `/api/payments/verify` checks Razorpay's **HMAC-SHA256 signature** with your secret key before marking the order PAID and reducing stock — in one database transaction.
4. `/api/payments/webhook` is a server-to-server backup in case the customer closes the browser mid-payment. Both paths are idempotent, so an order can never be marked paid twice.

Full commented code: `lib/services/paymentService.ts` and `lib/services/orderService.ts`.

## 7. Set up emails (Resend)

1. Sign up at https://resend.com → **API Keys** → create a key → set `RESEND_API_KEY` in `.env`.
2. For testing, keep `EMAIL_FROM="Urban Noor <onboarding@resend.dev>"` — Resend only delivers these to **your own Resend account email**.
3. To email real customers: Resend → **Domains** → add your domain (e.g. `urbannoor.in`), add the DNS records it shows, then set `EMAIL_FROM="Urban Noor <orders@urbannoor.in>"`.

Emails sent: order confirmation (customer), new-order alert (`ADMIN_NOTIFY_EMAIL`), shipped / delivered / cancelled updates, password reset, welcome.
With `RESEND_API_KEY` empty, every email (and the password-reset link) is printed in the terminal instead.

## 8. Deploy to Vercel

1. Push the project to GitHub (VS Code → Source Control → Publish to GitHub; `.env` is git-ignored, good).
2. https://vercel.com → **Add New → Project** → import the repo. Framework: Next.js (auto-detected).
3. **Environment Variables:** add every variable from your `.env`. Change `NEXT_PUBLIC_SITE_URL` to your real URL (e.g. `https://urbannoor.vercel.app` or your domain).
4. Deploy. (The build runs `prisma generate` automatically. Tables already exist from step 5; for future schema changes run `npm run db:deploy` against production.)
5. **Razorpay webhook:** Razorpay Dashboard → Account & Settings → **Webhooks** → Add:
   - URL: `https://<your-domain>/api/payments/webhook`
   - Secret: the same value as `RAZORPAY_WEBHOOK_SECRET`
   - Events: `payment.captured`, `payment.failed`, `order.paid`
6. **Custom domain:** Vercel → Project → Settings → Domains.
7. **Going live with payments:** complete Razorpay KYC, switch to **Live Mode**, generate live keys, replace the three Razorpay env vars in Vercel, create the webhook again in Live Mode, then redeploy.

> Note: Vercel's free Hobby plan is meant for non-commercial use; a store selling products may need the Pro plan. Check Vercel's current terms.

---

## Daily use

| Task | Where |
|---|---|
| Add a product | Admin → Products → **Add product** (upload photos, drag to reorder, first = cover) |
| Ship an order | Admin → Orders → open order → status **SHIPPED** + courier + tracking → **Update** (customer gets an email) |
| Run a sale | Admin → Coupons → New coupon |
| Change banner / announcement / shipping fee | Admin → Store Settings |
| Edit policy text | `app/(store)/policies/[slug]/page.tsx` — **replace placeholder text with your real business details before going live** |
| Browse the database | `npm run db:studio` |
| Change brand colours | `tailwind.config.ts` → `colors` (noir = backgrounds, ivory = text, gold / magenta / royal = accents) and `app/globals.css` |

Changes in the admin panel appear on the store immediately (cached pages are refreshed automatically).

## Project structure

```
urban-noor/
├─ app/
│  ├─ (store)/          customer pages: home, shop, product, cart, checkout, account, policies…
│  ├─ admin/            admin login + (panel)/ dashboard, products, orders, coupons, settings…
│  ├─ api/              API route handlers (thin: validate → call service → respond)
│  ├─ layout.tsx        fonts, SEO defaults, providers
│  ├─ sitemap.ts, robots.ts, not-found.tsx
├─ components/          UI: store/, home/, product/, shop/, checkout/, account/, admin/, providers/
├─ lib/
│  ├─ services/         ALL business logic (product, cart, order, payment, coupon, auth, email…)
│  ├─ prisma.ts  auth.ts  jwt.ts  razorpay.ts  supabase.ts  validators.ts  utils.ts
├─ emails/templates.ts  branded HTML emails
├─ prisma/              schema.prisma + seed.ts
├─ public/seed/         placeholder product images (replace with real photos via admin)
├─ middleware.ts        protects /account and /admin
└─ .env.example
```

All business logic lives in `lib/services/` — the API routes only call it. If you ever outgrow Vercel and want a separate Node/Express backend, these service files move over unchanged.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Can't reach database server` | Check `DATABASE_URL` / `DIRECT_URL` and password. Supabase free projects pause after a week of inactivity — open the Supabase dashboard and click **Restore**. |
| `prepared statement "s0" already exists` | Your `DATABASE_URL` is missing `?pgbouncer=true`. |
| `JWT_SECRET is missing` | Set a long random `JWT_SECRET` in `.env` and restart. |
| "Payments are not configured" | Add the Razorpay keys to `.env` and restart `npm run dev`. |
| Image upload fails | Bucket must be named exactly `product-images` and be **Public**; check `SUPABASE_URL` and service role key. (Without Supabase, uploads save to `public/uploads` in development only.) |
| Images from Supabase don't show | Restart dev server after editing `next.config.mjs`; URLs must be `https://<project>.supabase.co/...`. |
| Password reset email not arriving | With no `RESEND_API_KEY` the link is printed in the terminal. With `onboarding@resend.dev`, Resend only delivers to your own account email. |
| Changed `.env` but nothing happened | Stop the server (Ctrl+C) and run `npm run dev` again. |

## Before you go live — checklist
- [ ] Change admin email/password, run `npm run db:seed`
- [ ] Replace sample products & placeholder images with real ones (or delete them in admin)
- [ ] Edit policy pages with your legal business name, address and timelines
- [ ] Update Store Settings (WhatsApp, email, phone, address, Instagram)
- [ ] Verify your domain in Resend and update `EMAIL_FROM`
- [ ] Razorpay KYC → live keys → live webhook
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your real domain
