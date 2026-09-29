# Makosi Traditional Healing — deployed on Vercel

A single Next.js repository for the Makosi Traditional Healing franchise
site — the two-branch landing page, the **Journey Home Healing** branch,
the **Makosi Herbal & Holistic Products** storefront, one customer
account that works across both branches, and the founder's practitioner
dashboard.

## What's real vs. what's a stub

This repo is not a design mockup — signup, login, the product catalog,
and the client notes tool are genuinely wired to a database and will
work once you connect a Supabase project (see "Getting started" below).
Two screens are intentionally UI only, because they depend on paid
third-party services this repo can't provision for you:

| Feature | Status |
|---|---|
| One account across both branches (signup/login), including "Continue with Google" | **Real** — Supabase Auth (email/password + Google), Postgres via Prisma |
| Herbal & Holistic product catalog, split by category, with photos | **Real** — admin can add/remove products (with a photo, via Supabase Storage) from the live page, changes persist |
| Session booking — the founder opens times, customers book/cancel | **Real** — `/journey-home`, backed by the database, race-safe (two people can't book the same slot) |
| Testimonials — customers submit, founder approves, shown publicly | **Real** — moderation queue in `/dashboard`, approved stories shown on both branch pages and the homepage |
| Wishlist — customers save products, view them on `/favorites` | **Real** — per-account, backed by the database |
| Buying products online — cart, delivery address, courier fee, card payment | **Real** — Yoco hosted checkout, flat-rate shipping zones the founder sets, real order records. See "Selling products online" below to switch it on |
| "Find Your Path" wellness quiz on the homepage | **Real**, fully client-side — a few questions steer the visitor to a branch or the shop |
| Practitioner dashboard — client list, per-client notes, bookings, testimonial moderation | **Real** — admin-only, backed by the database |
| WhatsApp-style chat screen | **UI stub** — see `src/app/chat/[clientId]/page.tsx` and `src/app/api/whatsapp/webhook/route.ts` for exactly what's missing and why |
| Video call screen (with the anonymous toggle) | **UI stub** — see `src/app/call/[sessionId]/page.tsx`; the anonymous toggle itself works, there's just no real camera/mic behind it |

## Getting started

Auth and the database both run on [Supabase](https://supabase.com) —
there's no local-only fallback, so the app needs a real Supabase project
before anything (including plain email/password signup) will work.

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard) (the free tier is enough for this).
2. **Copy your keys into `.env`:**
   ```bash
   cp .env.example .env
   ```
   Fill in, all from the Supabase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page. Server-only; never expose this to the browser.
   - `DATABASE_URL` / `DIRECT_URL` — Settings > Database > Connection string (`DATABASE_URL` is the pooled port-6543 URL with `?pgbouncer=true`; `DIRECT_URL` is the direct port-5432 URL, used only by `prisma db push`)
   - `ADMIN_PASSWORD` (and optionally `ADMIN_NAME` / `ADMIN_EMAIL`) — the founder's login
3. **Create the tables and install the app:**
   ```bash
   npm install
   npm run db:push
   ```
4. **Run the one-time SQL scripts** — open the Supabase dashboard's SQL
   Editor and run each of these, in order:
   - `supabase/sql/001_profiles.sql` — the foreign key from `profiles` to
     Supabase's own `auth.users` table, Row Level Security policies, and
     the trigger that creates a `profiles` row automatically every time
     someone signs up (see "Google sign-in" below for why this can't just
     live in `schema.prisma`).
   - `supabase/sql/002_storage.sql` — creates the public `product-images`
     bucket and the policies that let an admin upload/replace/delete
     photos from the "Add a Product" form while everyone else can only
     view them.
5. **Seed the founder's admin account:**
   ```bash
   npm run db:seed
   ```
6. ```bash
   npm run dev   # http://localhost:3000
   ```

Sign in at `/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you put in
`.env` to reach `/dashboard` and the "Add a Product" / "Add a Client"
forms. Anyone else who signs up through `/login` — with a password or
with Google — gets an ordinary customer account (browse-only).

### Google sign-in

Unlike the rest of this setup, Google is configured **inside the
Supabase dashboard**, not in this repo's `.env`:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an OAuth client ID of type **Web application**, with authorized
   redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (Supabase's own callback — find the exact URL on the provider settings
   page in step 2).
2. In the Supabase dashboard: **Authentication > Providers > Google**,
   paste in that client ID/secret and enable the provider.
3. In **Authentication > URL Configuration**, add
   `http://localhost:3000/auth/callback` (and your production URL's
   equivalent, once you have one) to Redirect URLs.

Supabase then handles the whole OAuth exchange; this app's part is just
`src/app/auth/callback/route.ts`, which finishes the sign-in and sets the
session cookie once Supabase redirects back. Google and password sign-in
share the same `profiles` row when the email matches — one account, both
branches, however you sign in.

### Selling products online

Checkout uses [Yoco](https://www.yoco.com) — built for South African
businesses — with flat-rate delivery zones you set yourself rather than a
live courier API. Three things to set up:

1. **Get a Yoco business account** and, from the Yoco dashboard, your
   **Secret Key** (Developer / API Keys). Put it in `.env` as
   `YOCO_SECRET_KEY`. Yoco gives you separate test and live keys — use the
   test one while you're trying this out; nothing is charged for real
   until you switch to the live key.
2. **Register the webhook.** In the Yoco dashboard, under Developer >
   Webhooks, add an endpoint pointing at
   `https://<your-domain>/api/webhooks/yoco` and copy the signing secret
   (`whsec_...`) into `.env` as `YOCO_WEBHOOK_SECRET`. This is the piece
   that actually confirms a payment went through — the redirect back to
   your site after paying is just for the customer's benefit, an order
   isn't marked paid until this webhook fires, so it has to be reachable
   from the internet. Testing locally means tunneling to your dev server
   (e.g. `ngrok http 3000`) and using that tunnel's URL here instead of
   `http://localhost:3000`.
3. **Add at least one delivery zone** — sign in as the admin and go to
   `/dashboard`, "Delivery Zones". Customers can't check out until at
   least one exists; each one is just a name, an optional description,
   and a flat fee in Rands (e.g. "Local — R60", "National — R150").

From there: set a product's "Online price" in `/herbal-holistic`'s "Add a
Product" form (blank = browse/inquiry only, same as before) and it gets a
real "Add to Cart" button. `src/lib/yoco.ts` has the checkout-creation and
webhook-verification code, both checked directly against Yoco's API docs
rather than assumed — see the comments there for what was and wasn't
possible to confirm.

## Project structure

```
supabase/sql/
  001_profiles.sql       run once in the Supabase SQL editor — see "Getting started"
  002_storage.sql         product-images bucket + upload policies
prisma/
  schema.prisma           Profile, Product, Favorite, Appointment, Testimonial, CartItem,
                          ShippingZone, Order, OrderItem, Client, Note models (Postgres)
  seed.ts                  creates the founder's admin account via Supabase's Admin API
src/
  app/
    page.tsx             franchise landing page — wellness quiz + testimonial wall
    journey-home/         Journey Home Healing branch — booking system + testimonials
    herbal-holistic/      product storefront — photos, favorites, testimonials, cart
    favorites/            signed-in customers' saved products
    cart/                  the shopping cart
    checkout/              delivery address + zone + "Pay with Yoco"
    orders/                order history; orders/[id]/ is the payment confirmation page
    login/                sign in / create account (one account, both branches, incl. Google)
    auth/callback/        finishes Google sign-in / email confirmation, sets the session
    dashboard/             admin-only: clients, bookings, testimonials, orders, delivery zones
      clients/[id]/        admin-only: notes for one client
    chat/[clientId]/       UI stub — see table above
    call/[sessionId]/      UI stub — see table above
    api/
      auth/signout/        the only auth route this app still owns — sign-in/up go straight to Supabase
      products/            list/create/delete (create accepts an imageUrl and an online priceCents)
      favorites/            list/save/remove — the wishlist
      appointments/         list/open a slot/book/cancel/remove — the booking system
      testimonials/          list approved/submit/approve/reject
      cart/                  list/add/set quantity/remove
      shipping-zones/        list (public)/create/delete (admin)
      orders/                 create (→ Yoco checkout)/list/get one/set fulfillment
      webhooks/yoco/           marks an Order PAID/FAILED — see "Selling products online"
      clients/              list/create
      notes/                list/create
      whatsapp/webhook/    stub — see file for the integration checklist
  components/
    ProductManager.tsx      admin add/remove + photo upload + online price, customer favorite/cart
    BookingManager.tsx      the /journey-home booking widget (customer + admin views)
    TestimonialWall.tsx     public testimonial display + "Share Your Story" form
    WellnessQuiz.tsx        homepage "Find Your Path" quiz (client-side only)
    FavoritesGrid.tsx        /favorites page grid
    CartManager.tsx          /cart quantity steppers + subtotal
    CheckoutForm.tsx         /checkout address form, zone picker, order summary
    OrderStatusPoller.tsx    refreshes the confirmation page once the webhook lands
    AdminBookings.tsx        dashboard: who's booked
    TestimonialModeration.tsx dashboard: approve/reject queue
    AdminOrders.tsx           dashboard: paid orders, mark shipped
    ShippingZoneManager.tsx   dashboard: add/remove delivery zones
    ClientManager.tsx, NotesManager.tsx, Navbar.tsx, FormMessage.tsx
  lib/
    db.ts                  Prisma client
    auth.ts                 getSessionUser() / requireAdmin() — reads the Supabase session, joins profiles.role
    supabase/               browser + server Supabase clients
    yoco.ts                  createYocoCheckout() + verifyYocoWebhookSignature()
  middleware.ts           refreshes the Supabase session cookie on every request
  styles/globals.css     brand tokens (colors, fonts, shared animations) used by every page
```

## Where this can go next

**WhatsApp chat.** Requires Meta Business verification, a WhatsApp
Business Platform (Cloud API) phone number, and a webhook — the stub at
`src/app/api/whatsapp/webhook/route.ts` explains the exact steps and
what still needs to be added to the schema. Note: the Cloud API only
covers messages sent *after* someone messages your business number —
there's no way to import a client's existing personal WhatsApp history,
and it doesn't cover calls at all.

**Video calls.** Needs a real-time video provider — Twilio Video, Agora,
or Daily.co are the common choices, all with a free tier around 10,000
minutes/month and a rate near $0.004 per participant-minute after that.
`src/app/call/[sessionId]/page.tsx` has the exact swap-in point.

**Linking a Client to a real customer account.** The schema already has
an optional `userId` on `Client` for this. Nothing sets it yet — the
next step is deciding whether clients sign themselves up (match by
email at signup) or the founder invites/links them from the dashboard,
then wiring that flow up.

**Booking reminders.** Appointments are real, but nothing emails or
texts a reminder before one — Supabase doesn't send arbitrary emails on
its own. A Supabase Edge Function on a cron schedule, paired with an
email provider (Resend, Postmark) or an SMS one (Twilio), is the
straightforward way to add this without changing the booking data model.

**Order emails/SMS.** Checkout, payment, and fulfillment are real (see
"Selling products online"), but nothing emails an order confirmation or
shipping notice yet — same story as booking reminders above, a Supabase
Edge Function + Resend/Postmark/Twilio is the natural next step, and it
can reuse the same Order data.

**Live courier rates.** Shipping is deliberately flat-rate zones the
founder sets (see "Selling products online") rather than a live courier
API — accurate enough for a small shop and needs zero extra accounts.
Swapping in real-time quotes from an actual courier (The Courier Guy,
Pargo) later doesn't require changing the Order/OrderItem shape, just
how `shippingFeeCents` gets calculated at checkout.

**Refunds.** `src/lib/yoco.ts` only creates checkouts — Yoco's Checkout
API also has a refund endpoint, but there's no admin UI for it yet.
Today, refunding means doing it from the Yoco dashboard directly (the
Order's `status` in this app wouldn't reflect that automatically).

**Password reset, email verification, rate limiting.** These come free
with Supabase Auth (that's the whole point of using it over a hand-rolled
session system) — the reset flow and rate-limit thresholds are both
configurable in **Authentication** in the Supabase dashboard, not in this
repo's code.

## Device compatibility

Built mobile-first, since that's most of this audience — everything
below was a real fix, not just a nice-to-have:

- The `<meta name="viewport">` tag is set explicitly
  (`width=device-width, initial-scale=1` in `src/app/layout.tsx`'s
  `viewport` export). Without it phones render the page at desktop width
  and zoom out, which would silently undo every responsive rule below.
- Every multi-column layout (`.mk-grid-2/3/4` in `globals.css`) collapses
  to fewer columns under 860px and to one under 560px.
- The navbar's links wrap onto a second line rather than overflowing
  below 720px.
- The WhatsApp-chat and video-call UI stubs (`/chat/[clientId]`,
  `/call/[sessionId]`) used to be a hard-coded 390px wide, which
  overflowed most phone screens — now `width: 100%; max-width: 390px`.
- Admin forms with side-by-side fields (Add a Product, Open a New Slot)
  wrap to stacked fields instead of compressing when the screen narrows.
- Tap targets on icon-only buttons (the favorite heart) are padded out
  closer to the 44px touch-target guideline, not just sized to the glyph.
- `<video autoplay muted loop playsinline>` on the hero — `playsinline`
  specifically is what lets it autoplay inline on iOS Safari instead of
  forcing fullscreen.

## Design system

Colors, type, and layout throughout the app match the Journey Home
Healing logo: deep forest green, terracotta, warm ivory, gold, with
Playfair Display for headings and Work Sans for body text. The tokens
live in `src/styles/globals.css` — change them there and every page
picks it up.

A few shared pieces make the whole site feel like one considered system
rather than a stack of separate pages:

- `src/components/BrandMark.tsx` — the drop-in-a-ring mark used in the
  navbar and footer instead of a plain dot.
- `src/components/WaveDivider.tsx` — the soft curve between
  alternating-background sections, instead of a hard color edge.
- `src/components/Reveal.tsx` — fades/slides a section into place the
  first time it scrolls into view (`prefers-reduced-motion` disables it).
- `src/components/Toast.tsx` — floating confirmations ("Added to
  favorites", "Session booked") for actions without a natural inline spot
  to report success; mounted once in `src/app/layout.tsx`, used via
  `useToast()`.
- `.mk-card-hover`, `.mk-skeleton`, `.mk-pop-in`, `.mk-heart-burst` in
  `globals.css` — hover lift for browsable cards, shimmer loading
  placeholders, a pop-in animation for content that loads in after the
  page does, and a little "burst" on the favorite heart when it's tapped.
- `.mk-grid-2` / `-3` / `-4` in `globals.css` — every multi-column layout
  (product cards, branch cards, the "how it works" steps) uses one of
  these instead of a raw `gridTemplateColumns`, so they collapse to fewer
  columns on tablet and to one on phone. `src/components/Navbar.tsx`'s
  link row wraps the same way below 720px.
- `src/app/icon.svg` — the browser-tab favicon, the same mark as
  `BrandMark.tsx` on a solid background so it stays legible at 16px;
  Next.js serves it automatically, no `<link rel="icon">` needed.

### Hero video

The homepage hero is real aerial drone footage of the **Tugela River
Gorge** in the Drakensberg — where Thukela/Tugela Falls (uThukela, "the
startling one" in Zulu) drops nearly 1,000m, the traditional and
spiritual landmark the "uthekela falls" hero was asking for. It's stored
at `public/videos/uthekela-falls.mp4` (compressed to ~5.3MB so it
autoplays reasonably on a phone connection), rendered by
`src/app/page.tsx`.

**Source & license:** [Pexels](https://www.pexels.com/video/drakensberg-tugela-gorge-17789182/),
shot by Helmut Meijer, Pexels License (free for commercial use, no
attribution legally required — credited here anyway). Free stock footage
of the falls' cascade itself is essentially nonexistent — it's a remote,
hard-to-reach location — so this is the closest authentic match available
without commissioning original footage. To swap in different footage
later (a closer shot of the falls, or the founder's own video), replace
that file and keep the same path; the `<video>` tag in `page.tsx` needs
no changes.
