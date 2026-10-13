# Stack & Save — Sale Package

Standalone grocery savings app. Prepared for sale as an asset on October 13, 2026.

## What it is

Stack & Save takes a shopper's grocery basket, stacks sale prices + store coupons +
manufacturer coupons + rebate-app savings according to each store's coupon rules, and
prices the basket across 17 US store chains (6 regions) to recommend the cheapest
checkout — single store or a two-store split.

- **Free tier:** browse catalog, search, basket, UPC scanner, read the deal feed
- **Paid tier ($7/month "Checkout Saver"):** coupon auto-matching, checkout comparison,
  two-store split finder, deal alerts (gated server-side; Stripe wiring complete,
  keys not connected)

## What's in this package

| Path | Contents |
|---|---|
| `client/` | Frontend source (React + TypeScript), incl. 286 product images |
| `server/` | Backend actions (basket, compare engine, deals, alerts, Stripe) |
| `drizzle/` | Database migrations |
| `app.db` | SQLite database — seeded data as of Oct 13, 2026 (catalog, 61-deal coupon feed) |
| `Stack-Save-Test-Report.pdf` | 2-page test report on Redemption Road Music Group letterhead (8 passes, 2 pending) |
| `research/` | The two coupon-research reports behind the deal feed |
| `DATA-PLAN.md`, `AGENTS.md`, `space.json` | Build notes, agent conventions, job schedule |

## How to run it

1. Install [Bun](https://bun.sh) (v1.x).
2. `bun install`
3. Apply migrations: `bunx drizzle-kit migrate` (see `drizzle/`).
4. Set environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
   (and `STRIPE_PAYMENT_LINK` for the hosted checkout path). Billing stays visibly
   "not live" until these are set — by design.
5. `bun run dev` (see `package.json` for scripts).

The `refreshDeals` action rebuilds the coupon feed from weekly-ad research; it is
scheduled to run every Wednesday morning (~6:44 AM CT).

## Verified state (Oct 13, 2026)

PASS: catalog integrity (286 products / 16 categories) · category wall + search ·
photo audit (286/286 unique images, ~150 brand/label corrections) · comparison
engine math · 61-deal coupon feed (Oct 13–21 ads, all 17 stores, sourced) ·
server-side paywall · honest dated labeling · weekly refresh schedule.

PENDING / UNVERIFIED: Stripe end-to-end charge (needs real keys — buyer's step) ·
UPC camera scanning on a real phone (desktop-tested only; manual entry fallback exists).

## Honest disclosures for the buyer

1. **Prices are planning estimates, not live retailer prices.** Every figure is dated.
   Live pricing would require retailer data feeds.
2. **Product image licenses are NOT verified.** The 286 product photos were
   bulk-sourced from the web during the build; brand/label pairings were audited
   for truthfulness, but image licensing was not cleared. Re-source or license
   images before commercial launch.
3. **The coupon feed is curated, not exhaustive.** Many coupons live behind store
   logins; the app links each store's own coupon center for the complete list.
4. **No cart upload.** Checkout is a handoff (pick list / CSV / retailer deep link);
   the app never places orders or touches grocery money.