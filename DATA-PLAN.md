# Data Plan

## Context provenance
- The original request names Walmart, H-E-B, ALDI, United Supermarkets, Dollar General, and Family Dollar and asks for basket building, coupon application, price comparison, delivery checkout handoff, and extreme-couponing deals.
- The accepted follow-up fixes the product model: free catalog and basket; $7/month for coupon matching, checkout comparison, and deal alerts; grocery payment remains at the selected retailer, while Stripe subscription billing is explicitly deferred.
- The latest build direction expands full profile, coupon-engine, and checkout-comparison support to Kroger, Publix, Safeway/Albertsons, Target, Meijer, Giant Food, Stop & Shop, Food Lion, Costco, Sam's Club, and Piggly Wiggly; shoppers select Texas, Southeast, Northeast, Midwest, West, or National to determine relevant stores.
- Deep-research report `/home/hatch/workspace/research_notes/extreme-couponing-deals-20261008-1154/report.md` (researched Oct 8, 2026) supplies the initial six-store dated deal feed, official order/coupon links, fees, policies, and caveats.
- Deep-research report `/home/hatch/workspace/research_notes/regional-grocery-directory-20261008-1214/report.md` (researched Oct 8, 2026) supplies the ten additional store profiles. Unresolved Safeway, Food Lion, Giant, and Stop & Shop policy/URL details remain explicitly labeled, never silently resolved.

## Tested sources
### Six-store deal research
**Used by**: initial `refreshDeals`, deal feed, six launch-store profiles
**Test command**: `read /home/hatch/workspace/research_notes/extreme-couponing-deals-20261008-1154/report.md`
**Sample output**: dated Oct 5–13 weekly offers and coupon mechanics for Walmart, H-E-B, ALDI, United, Dollar General, and Family Dollar, with exact source URLs and caveats.
**Processing**: preserve item, quantity, coupon steps, price/final price only when supplied, validity dates, source URL, confidence, and caveats.

### Regional store directory research
**Used by**: region selector, store profiles, coupon rules, delivery notes, checkout handoff links
**Test command**: `read /home/hatch/workspace/research_notes/regional-grocery-directory-20261008-1214/report.md`
**Sample output**: profiles for Kroger, Publix, Safeway/Albertsons, Target, Meijer, Giant Food, Stop & Shop, Food Lion, Costco, and Sam's Club with exact ordering/coupon URLs, regions, fees, memberships, and stacking rules; unresolved claims are marked.
**Processing**: normalize into the same store-profile shape; include all stores in the coupon and comparison engines; do not manufacture exact coupon URLs where the report says one could not be verified.

### Piggly Wiggly policy search
**Used by**: Piggly Wiggly store profile and coupon-rule engine
**Test command**: `browser_search("Piggly Wiggly official online ordering delivery digital coupons coupon policy manufacturer store coupon stacking")`
**Sample output**: official shopthepig.com policy says coupon stacking is not allowed, coupon value cannot exceed product value, digital coupons can be clipped on the web/app/online shopping, and terms vary because stores are independently owned.
**Processing**: treat Piggly Wiggly as Southeast/Midwest regional coverage, show the independently-owned-location caveat, and advise confirmation with the local store. Use only exact URLs returned by search.

### Runtime web search
**Used by**: weekly `refreshDeals`
**Test command**: `bun /opt/hatch/skills/spaces/ts-runtime/dist/probe-ctx.js < /tmp/grocery_deals_probe.ts`
**Sample output**: 8 structured results with exact `url`, `source`, `snippet`, and date hints, including explicit Dollar General, H-E-B, Family Dollar, and ALDI deal terms.
**Processing**: one dated search per retailer for all 17 retailers (see the max-haul refresh policy in the 2026-10-13 coupon-haul section), distill only explicit deal terms, validate extracted source URLs against that store's returned result URL set, deduplicate by retailer + title, and keep the last successful snapshot when a search is thin. Every run records a per-store `deal_feed_checks` row; a store with no usable results is recorded with a note, never filled with invented deals.

## Long-term data behavior
- **Refresh policy**: weekly scheduled `refreshDeals`, plus manual refresh. Deal rows retain source and as-of time; stale rows remain labeled if refresh fails.
- **Growth**: store profiles are a researched catalog; basket items, checked state, confirmed price quotes, fees, chosen region, and checkout selections persist.
- **Ordering**: active deals by end date then retailer. Comparisons include every store selected for the region, rank only complete quotes, and calculate a cheapest two-store split when every item has at least one quote among the pair.
- **Time semantics**: source validity dates are date-only; refresh and user-write timestamps are instants rendered in the viewer locale.
- **Price semantics**: typical/sample October 2026 catalog prices are clearly dated and editable; never labeled live. Missing quotes are explicit and never zero-filled.
- **Checkout/payment boundary**: choose a store or split, generate a CSV/pick list, and deep-link to official ordering sites. Store logins, digital-coupon clipping, order placement, and grocery payment stay at the retailer. The artifact does not claim to upload carts without store authentication. The $7/month Checkout Saver subscription bills through Stripe (see the 2026-10-13 update below); grocery money is never part of that flow.

## Image plan
Product imagery is required for browsing and recognition. The catalog uses an owned, local image for every product card and detail sheet; comparison and store-rule surfaces remain typographic.

## Rejected approaches
- **Universal external cart insertion**: no authenticated retailer cart APIs or user store sessions were supplied. Use an honest order-sheet/CSV handoff and official deep links.
- **Invented live prices**: the supplied sources do not provide complete item-level pricing across all stores. Use clearly dated, editable typical/sample catalog prices and sourced current deals; show missing prices.
- **Silent conflict resolution**: Safeway/Albertsons and Food Lion stacking guidance conflicts across sources, while some exact coupon URLs were blocked. Mark these as local/policy confirmation required.
- **Fixed delivery totals**: fees depend on membership, location, basket threshold, timing, and checkout; user-confirmed fee estimates drive comparison.


## Product image catalog update
**Used by**: searchable product grid and product detail sheets
**Acquisition**: product-name image searches via the bundled image-search skill; each accepted JPEG/PNG/WebP was preflighted and copied into `client/src/assets/catalog/` so the artifact owns the bytes.
**Processing**: images identify the depicted grocery type or named branded cereal; alt text names the displayed product. Product cards keep prices labeled as editable October 2026 planning samples.
**Source pages**:
- bananas: https://www.merchantgenius.io/shop/url/rondelivery.com
- apples: https://www.lidl.co.uk/p/gala-apples/p10010557
- chicken-breast: https://www.vecteezy.com/free-photos/raw-file?page=2
- ground-beef: https://pr-14620-preview.supermarketnews.com/latest-news?page=75
- bacon: https://www.tysonfoodservice.com/products/wright/pork/bacon/00079621004209
- deli-turkey: https://ecomr4-uat.ama-nonprod.usfoods.com/products/9519869?lnksrc=customersAlsoBought&merchRank=9&variant=CAB
- eggs: https://www.startip.co.il/%d7%90%d7%99%d7%9a-%d7%9c%d7%94%d7%99%d7%95%d7%aa-%d7%9e%d7%a9%d7%95%d7%95%d7%a7-%d7%91%d7%99%d7%a6%d7%99%d7%9d/
- yogurt: https://mungart.com/search/Plain%20Yogurt
- bagels: https://www.ubereats.com/us-es/brand-city/kent-wa/fred-meyer
- rice: https://www.costcobusinesscentre.ca/p/-/riz-tuv-grande-harvest-181-kg/4201007875
- pasta: https://www.pinterest.com/ideas/italian-vintage-brands/902156861367/
- peanut-butter: https://www.vecteezy.com/members/sahrulhidayat
- canned-tomatoes: https://www.verda.studio/world-Mattarello-PICCOLO-CIOTTOLATO-1893426.html
- canned-tuna: https://www.Vecteezy.com/free-photos/tuna-label
- cheerios: https://theseedguelph.ca/product/cheerios-original-cereal-342g-1-box/
- honey-nut: https://azuregoods.co.uk/
- frosted-flakes: https://guest.postmates.com/store/wegmans-1405-main-st/FAI1a_40W4C4nHSStd18kg/7831870f-bd8a-4a2d-8db9-d1c7942d26c0?scats=7831870f-bd8a-4a2d-8db9-d1c7942d26c0
- ground-coffee: https://www.ebay.com/shop/folgers-coffee-singles?_nkw=folgers+coffee+singles
- frozen-pizza: https://mycornerbutcher.com/products?dir=desc&order=position&y_source=1_MjAzMDM1OTY2NS00NjktbG9jYXRpb24ucmVzZXJ2YXRpb25fdXJs
- frozen-vegetables: https://www.vujis.com/data/products/200490
- ice-cream: https://www.creativefabrica.com/et/png/diver-png-hXe8Ezhm0/
- orange-juice: https://www.empressedjuice.com/home
- potato-chips: https://www.Vecteezy.com/free-photos/bag-of-chips
- granola-bars: https://www.foodstories.shop/shop/product/gullon-no-sugar-added-chocolate-cream-biscuits/
- diapers: https://tpi.com.do/p/box-pampers-medium-152-41tp-889171
- baby-formula: https://identyme.com/breast-and-formula-feeding/
- paper-towels: https://liggohub.ru/product/408013
- toilet-paper: https://www.coles.com.au/product/quilton-3-ply-unscented-white-toilet-paper-12-pack-5034134
- laundry-detergent: https://www.vecteezy.com/free-photos/laundry-detergent-bottle
- toothpaste: https://WWW.ROSSMANN.DE/de/gesundheit-marvis-aquatic-mint-zahnpasta/p/8004395111725
- dog-food: https://portuguese.laminatedpackagingbags.com/sale-34800247-custom-food-packaging-pouch-with-zipper-eight-side-seal-resealable-dog-food-bag.html
- cat-litter: https://www.joinhoney.com/pt/shop/cvs/p/7422251010108067594_d0f128c2c13df8182b890f3eb1a1b9bb_577dd2314bb047e9123f22cbeaf3c0d0

Replacement product images:
- canned tuna: https://www.hy-vee.com/aisles-online/p/60847/starkist-chunk-light-tuna-in-water-5-oz-can?srsltid=AfmBOorcgywT8paPMT0FTI9qT3eYtrGGHbAKz9Uri4pRh_a1vishA9tR
- paper towels: https://www.kroger.com/p/bounty-double-roll-paper-towels/0003700095036
- sparkling water: https://www.ubereats.com/product/b/13f3ebd4-a191-50aa-a883-1a39f06d3f63

## Barcode catalog update
**Used by**: mobile UPC scanner and repeat-scan matching
**Known catalog mapping**: Original Cheerios 8.9 oz uses UPC `0001600027526`, verified from https://www.picknsave.com/p/big-g-cereal-original-cheerios-gluten-free-cereal/0001600027526 on 2026-10-08.
**Unknown UPC behavior**: unknown codes are never guessed. The shopper enters a name, unit, and one price; the app stores that UPC mapping and adds shopper-entered estimates for the selected area stores. Each store quote remains editable before comparison.

## Expanded catalog and price freshness
- The browse catalog contains 286 grocery and household products across produce, meat, dairy, bakery, pantry, canned goods, coffee and tea, frozen foods, beverages, snacks, baby, household, cleaning, personal care, and pet supplies.
- New catalog products intentionally start without a shelf price rather than inventing one. Existing planning estimates retain an explicit October 8, 2026 update date and remain shopper-editable. (Superseded 2026-10-13: every variant now carries an inherited family estimate — see below.)
- The image-search acquisition pass used one item-specific query per added product, selected a product-accurate returned image, preflighted its bytes, converted it to owned WebP storage, and retained a distinct asset and rendered URL per catalog product. A clearly item-specific local treatment is used for the one paper-towel variant whose searched image could not be retained; it is not represented by an unrelated grocery photo.
- `scripts/verify-catalog-images.ts` is the release gate: the 286 catalog products, product slugs, local image mappings, distinct rendered image URLs, and owned image files must all equal 286, with no missing mappings.
- Dated sale prices from the sourced deal feed override matching catalog estimates only for explicitly mapped items or strict product-name matches. `refreshDeals` also updates matching items already in the basket, carrying the deal source and refresh date into the quote.
- Every displayed grocery amount exposes an update date. Comparison and checkout totals show the date range of their inputs; unentered delivery fees and missing prices remain explicit rather than appearing as current zero-dollar prices.

## 2026-10-13 full-scope update

### Photo/label truth pass
- All 286 product photos were visually audited against their labels. Wherever the photo showed a real trademarked brand under a generic or "Store brand" label, the product was re-labeled with the true brand (base examples: Tillamook yogurt, Folgers ground coffee, StarKist tuna, Del Monte tomatoes, Twinings tea, LaCroix sparkling water, Nature Valley bars, Bounty towels, Quilton toilet paper, Marvis toothpaste, Purina Dog Chow, Snack Box Pros pod tray; ~150 variant-level brand assignments in `server/src/catalog-extra.ts`, e.g. Pampers/Huggies/Parent's Choice diapers, Tide/Purex/Persil laundry, Dawn/Ajax dish soap, Barilla pasta). Cereal units were corrected to the pictured sizes (Honey Nut Cheerios 27.2 oz, Frosted Flakes 12 oz, Froot Loops 16.6 oz, Cheerios 12.6 oz/358 g).
- Two photos were replaced with owned bytes sourced via the image-search skill: the base diapers photo (foreign-market Pampers Baby-Dry Pants pack) is now a US Target Up & Up Overnight Diapers size 3 box (source page: https://registry.thebump.com/taylor-feth-josiah-feth-august-2024-mn/50153217), and the base rice photo (French-text 40 lb parboiled sack) is now a Food Lion Enriched Long Grain White Rice 2 lb bag (source page: https://mungart.com/search/Long%20Grain%20Rice%20Oz); both products were re-labeled to match.

### Variant price estimates
- The 243 variant products now inherit a planning estimate: family base price (same dated estimate as the family's base catalog product) × a per-variant factor reflecting the pictured package's brand/size, stamped `estimateUpdatedAt` 2026-10-13 and always rendered as "Planning estimate". Comparisons work out of the box; every figure stays shopper-editable.

### Deal feed expansion (researched 2026-10-13)
The curated baseline was rebuilt from current weekly-ad and couponing sources; expired rows remain in the feed and render with an "Expired" label rather than being deleted. Sources (verbatim):
- Publix 10/15–10/21 BOGOs: https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/
- Kroger 10/14–10/20: http://weeklyadhunters.com/kroger-weekly-ad/
- Target 10/11–10/17: https://weeklyadhunters.com/target-weekly-ad/ and https://hip2save.com/deals/target-sales-this-week/
- Meijer 10/14–10/20: https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/
- Giant Food 10/9–10/15: https://weeklyadhunters.com/giant-food-weekly-ad/
- Stop & Shop 10/9–10/15: https://weeklyadhunters.com/stop-and-shop-weekly-ad/
- Food Lion: https://weeklyadhunters.com/food-lion-weekly-ad/ and https://smartdealshub.co/food-lion/food-lion-weekly-ad-2605516&expired=true/
- Safeway week of 10/9–10/15 (regional roundup; caveats carry the ambiguity): https://www.weeklyad.io/safeway
- Costco coupon book 9/21–10/18: https://thekrazycouponlady.com/tips/couponing/costco-coupon-book
- Sam's Club (Oct 10 roundup): https://www.moneylion.com/trending/money/sams-club-groceries-worth-money
- Piggly Wiggly 10/14–10/20: https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/
- H-E-B weekly deals: https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024
- ALDI Finds: https://www.tastingtable.com/2274778/best-new-aldi-products-october-2026/ and https://www.eatingwell.com/aldi-finds-october-2026-12166366
- United wine event 10/5–11/1 (from the printed flyer): https://www.hotcouponworld.com/unitedsupermarkets-weekly-ad/
- Dollar General Saturday scenarios: https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more
- Family Dollar 10/11–10/17: https://weeklyadhunters.com/family-dollar-weekly-ad/
- Walmart October roundup: https://www.livingrichwithcoupons.com/2026/10/best-walmart-deals-october-2026.html
No deal is ever sourced from a video page; the earlier YouTube-sourced Kroger coffee row was removed from the curated set.

### Weekly coupon haul (researched 2026-10-13, week of Oct 13–19) and max-haul refresh
- A deep-research haul added 113 sourced deals to the curated baseline (external keys `2026-w42-*`), bringing the baseline to 174 deals — 8–12 per store across all 17 stores. Every value, date, coupon step, and caveat was carried from the research report verbatim in substance; deals whose source stated no end date keep `validThrough: null` with a caveat saying so. Sources (verbatim):
  - Walmart: https://thekrazycouponlady.com/coupons-for/walmart ; https://thekrazycouponlady.com/deals/extreme-couponing ; https://thekrazycouponlady.com/2026/10/11/save-5-on-no7-beauty-products-at-walmart
  - H-E-B: https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad ; https://www.savingourway.com/post/h-e-b-digital-coupon-on-zyrtec ; https://thekrazycouponlady.com/coupons/luvs
  - ALDI: https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads ; https://passionatepennypincher.com/aldi-ad/
  - United: https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/ ; https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/ ; https://simplycodes.com/store/unitedsupermarkets.com
  - Dollar General: https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more ; https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html
  - Family Dollar: https://weeklyadhunters.com/family-dollar-weekly-ad/ ; https://www.familydollar.com/smart-coupons ; https://www.familydollar.com/coupon-details
  - Kroger: https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more ; https://thekrazycouponlady.com/coupons-for/kroger ; https://hip2save.com/deals/kroger-deal-days/ ; https://www.krogerkrazy.com/kroger-weekly-coupon-matchups/
  - Publix: https://www.iheartpublix.com/2026/10/get-cans-of-pringles-potato-crisps-for-just-1-02-each/ ; https://www.iheartpublix.com/2026/10/get-cartons-of-progresso-broth-for-just-1-15-at-publix/ ; https://www.iheartpublix.com/2026/10/grab-arm-hammer-laundry-detergent-as-low-as-1-05-at-publix-5/ ; https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/
  - Safeway/Albertsons: https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/
  - Target: https://thekrazycouponlady.com/coupons-for/target
  - Meijer: https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/
  - Giant: https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24 ; https://forthemommas.com/category/store-deals/giant-food-store ; https://giantfood.com/savings/coupons/browse
  - Stop & Shop: https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html ; https://www.dontpayfull.com/at/stopandshop.com
  - Food Lion: https://weeklyadhunters.com/food-lion-weekly-ad/ ; https://progressivegrocer.com/food-lion-offers-mvp-fall-haul
  - Costco: https://passionatepennypincher.com/costco-deals-this-month/ ; https://thekrazycouponlady.com/tips/couponing/costco-coupon-book
  - Sam's Club: https://thekrazycouponlady.com/coupons-for/sams-club
  - Piggly Wiggly: https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/ ; https://tangipig.com/
- **Open questions carried from the research (shown as caveats, never resolved by guessing)**: ALDI's Oct 14–20 ad had not been posted by any source on Oct 13, so ALDI rows are the Oct 7–13 ad and render expired; Safeway/Albertsons coverage likewise ends Oct 13 with the new ad uncovered; Sam's Club is between Instant Savings books (next predicted Oct 28–Nov 29), so its rows are member/clearance prices; Piggly Wiggly digital coupons come from one Louisiana franchise site and programs vary by independently owned store; United has no coupon-blog matchup coverage, so its rows are ad prices plus the recurring online promo; Food Lion Fall Haul window dates differ between the two sources and both are stated.
- **Max-haul refresh policy (replaces the single combined search)**: `refreshDeals` upserts the curated baseline, then runs one targeted web search + one bounded extraction **per store for all 17 stores**, targeting 8–10 current deals per store. Extractions are restricted to the store being searched, validated against the exact result URLs returned for that store, and deduplicated against the whole feed by retailer + normalized title. Expired deals are never deleted — they stay in the feed labeled "Expired"; a store's current deals replace its expired ones in practice because alerts, catalog sale prices, and the feed check count only current rows. Each run records one `deal_feed_checks` row per store (checked time, current-deal count, note). A store with no usable results — or a failed check — gets a recorded note that renders in the store's coupon-directory row; no deals are ever invented to fill a gap. The weekly Wednesday cron (`grocery-ordering-system-weekly-deals`) invokes this same action, so the max-haul behavior is the scheduled behavior too.

### Checkout Saver billing (Stripe) and deal alerts
- **Gating**: free tier = catalog browse, search, basket building, UPC scanner, deal-feed reading. Saver = coupon auto-matching (sale prices in catalog/quotes), checkout comparison + two-store split, checkout handoff, and deal alerts. Gating is enforced server-side in `getDashboard`, `addCatalogItem`, `refreshDeals`, and `chooseCheckout`, not just hidden in the UI.
- **Stripe integration**: the owner connects their own Stripe account in the plan sheet: a $7/month Payment Link URL plus their secret key (publishable key optional). The secret key is stored only in the artifact's private database and is never returned by any action (only a "set" boolean). Subscribe opens the owner's Stripe Payment Link; "verify" looks the customer's email up in Stripe (`GET /v1/customers`, `GET /v1/subscriptions`) and activates Saver only when Stripe reports an active/trialing subscription. Status refresh and cancel-at-period-end call the Stripe API directly. Without the owner's keys, billing is visibly not live and nothing is charged — no demo activation exists.
- **Deal alerts**: derived live on each dashboard load for Saver users — current deals at the shopper's area stores that match basket contents (word match or catalog deal mapping) appear as alerts; deals refreshed within 7 days show as NEW until marked seen (`alert_seen` table). The weekly `refreshDeals` cron is what makes new alerts appear.
