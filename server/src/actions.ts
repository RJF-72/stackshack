import { defineAction, z, type ActionsModule, type Ctx } from "@hatch/space-sdk";
import { and, asc, desc, eq } from "drizzle-orm";
import * as schema from "./schema";
import { extraCatalog } from "./catalog-extra";

const retailerValues = schema.retailerIds;
const regionValues = schema.regionIds;
type RetailerId = (typeof retailerValues)[number];
type RegionId = (typeof regionValues)[number];

const stores: Array<{
  id: RetailerId;
  name: string;
  short: string;
  regions: RegionId[];
  orderUrl: string;
  couponUrl: string | null;
  delivery: string;
  rule: string;
  membership: string;
  policyStatus: "verified" | "confirm_local";
}> = [
  { id: "walmart", name: "Walmart", short: "WM", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.walmart.com", couponUrl: null, delivery: "Walmart+ offers free same-day delivery on $35+; nonmember fees are typically $7.95–$9.95. Confirm at checkout.", rule: "One manufacturer coupon per item; no traditional stacking. Pair eligible rollbacks with rebate apps. Walmart Cash cannot combine with a paper manufacturer coupon on the same item.", membership: "No membership required; Walmart+ optional.", policyStatus: "verified" },
  { id: "heb", name: "H-E-B", short: "HEB", regions: ["texas"], orderUrl: "https://www.heb.com", couponUrl: "https://www.heb.com/digital-coupon/coupon-selection/all-coupons", delivery: "Curbside is free on $35+; Favor handles home and rapid delivery. Confirm fees locally.", rule: "One manufacturer coupon plus one H-E-B yellow store coupon may stack. Digital and paper coupons do not stack on the same item.", membership: "No membership required.", policyStatus: "verified" },
  { id: "aldi", name: "ALDI", short: "ALDI", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://shop.aldi.us", couponUrl: null, delivery: "Instacart-powered pickup and delivery. Online prices may be higher than in store; fees vary.", rule: "No manufacturer coupons. Weekly prices and eligible rebate apps are the savings path.", membership: "No membership required; Instacart+ optional.", policyStatus: "verified" },
  { id: "united", name: "United Supermarkets", short: "UNITED", regions: ["texas"], orderUrl: "https://www.shopunitedsupermarkets.com/", couponUrl: "https://www.shopunitedsupermarkets.com/", delivery: "Pickup and delivery at participating locations; fees appear at checkout.", rule: "One United store coupon plus one manufacturer coupon per item; no overage.", membership: "Free forU account for digital coupons.", policyStatus: "verified" },
  { id: "dollar_general", name: "Dollar General", short: "DG", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.dollargeneral.com", couponUrl: "https://www.dollargeneral.com/deals", delivery: "Same-day options vary; DoorDash or Uber Eats fees and tips may apply.", rule: "One manufacturer coupon plus one DG store coupon per item. Saturday $5 off $25 uses post-store-discount threshold math.", membership: "Free myDG account for digital coupons.", policyStatus: "verified" },
  { id: "family_dollar", name: "Family Dollar", short: "FD", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.familydollar.com", couponUrl: "https://www.familydollar.com/smartcoupons", delivery: "DoorDash and Instacart-powered same-day options vary by area; fees and tips may apply.", rule: "One manufacturer coupon plus one Family Dollar coupon per item. Saturday $5 off $25 is applied after other discounts; Smart Coupons are in-store only.", membership: "Free account for Smart Coupons.", policyStatus: "verified" },
  { id: "kroger", name: "Kroger", short: "KROGER", regions: ["texas", "southeast", "midwest", "west"], orderUrl: "https://www.kroger.com", couponUrl: "https://www.kroger.com/d/coupons", delivery: "Pickup is free on $35+. Boost has $59/$99 annual tiers; the $99 tier includes free same-day delivery on $35+. Express is $4.95.", rule: "Current policy allows one store OR manufacturer coupon per item, not both. Maximum three identical coupon redemptions per household per day.", membership: "Free Shopper’s Card; paid Boost optional.", policyStatus: "verified" },
  { id: "publix", name: "Publix", short: "PUBLIX", regions: ["southeast"], orderUrl: "https://www.publix.com/shop", couponUrl: "https://www.publix.com/savings/digital-coupons", delivery: "Instacart delivery starts around $3.99 on $35+ plus service fee; curbside fees vary. In-store pickup is free.", rule: "One manufacturer coupon plus one Publix store or accepted competitor coupon per item; not all three. Limit eight identical coupons per household daily.", membership: "No membership required; Club Publix is free.", policyStatus: "verified" },
  { id: "safeway", name: "Safeway / Albertsons", short: "SAFEWAY", regions: ["texas", "northeast", "midwest", "west"], orderUrl: "https://www.safeway.com", couponUrl: "https://www.safeway.com/foru-guest.html", delivery: "FreshPass is $12.99/month or $99/year with free delivery on $30+; standard window fees are roughly $3.95–$5.95.", rule: "Official for U terms say offers cannot combine with other offers; secondary guidance conflicts on store-plus-manufacturer stacking. Confirm the exact offer.", membership: "Free for U account; paid FreshPass optional.", policyStatus: "confirm_local" },
  { id: "target", name: "Target", short: "TARGET", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.target.com", couponUrl: "https://www.target.com/circle", delivery: "Drive Up and pickup are free on $35+. Same-day is $9.99/order or included on $35+ with Circle 360.", rule: "One manufacturer coupon, one Target coupon, and one Target Circle offer may combine per item. Four identical coupons per household daily; no overage.", membership: "Target Circle is free; Circle 360 is optional.", policyStatus: "verified" },
  { id: "meijer", name: "Meijer", short: "MEIJER", regions: ["midwest"], orderUrl: "https://www.meijer.com", couponUrl: "https://www.meijer.com/content/shopping/coupons.html", delivery: "Pickup is free on $35+ and $4.95 under $35. Shipt delivery is about $9.95/order; fees vary.", rule: "One manufacturer coupon per item may combine with applicable Meijer store coupons when the coupon terms allow. No overage.", membership: "Free mPerks; Shipt optional.", policyStatus: "verified" },
  { id: "giant", name: "Giant Food", short: "GIANT", regions: ["northeast"], orderUrl: "https://giantfood.com/", couponUrl: null, delivery: "Giant Delivers is reported free Tue–Thu and $3.95 Fri–Mon on $30+; Giant Pickup is reported free. Confirm locally.", rule: "A store coupon and manufacturer coupon may combine. A digital coupon cannot combine with a paper manufacturer coupon on the same item. Limit five identical manufacturer coupons.", membership: "Free GIANT Card / Flexible Rewards.", policyStatus: "confirm_local" },
  { id: "stop_shop", name: "Stop & Shop", short: "STOP & SHOP", regions: ["northeast"], orderUrl: "https://www.stopandshop.com", couponUrl: "https://stopandshop.com/dashboard/coupons-deals", delivery: "GO Pass is $12.95/month or $119/year with free delivery on $100+ and free pickup; other fees vary.", rule: "One digital store coupon plus one paper manufacturer coupon may stack. Sources conflict on competitor coupons; confirm current local policy.", membership: "Free GO Rewards; paid GO Pass optional.", policyStatus: "confirm_local" },
  { id: "food_lion", name: "Food Lion", short: "FOOD LION", regions: ["southeast", "northeast"], orderUrl: "https://shop.foodlion.com", couponUrl: null, delivery: "To Go pickup is reported $1.99 on $35+; Instacart, DoorDash, and Uber Eats delivery fees vary.", rule: "Sources conflict on store-plus-manufacturer stacking. Confirm the current policy with your local store before relying on a stack.", membership: "Free MVP card.", policyStatus: "confirm_local" },
  { id: "costco", name: "Costco", short: "COSTCO", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.costco.com", couponUrl: null, delivery: "Same-day via Instacart uses marked-up prices and a $35 minimum; reported fee is about $6.99 without Instacart+.", rule: "No manufacturer coupons. Member coupon-book savings apply automatically.", membership: "Required: Gold Star $65/year or Executive $130/year.", policyStatus: "verified" },
  { id: "sams_club", name: "Sam’s Club", short: "SAM’S", regions: ["national", "texas", "southeast", "northeast", "midwest", "west"], orderUrl: "https://www.samsclub.com", couponUrl: "https://help.samsclub.com/app/answers/detail/a_id/1130", delivery: "Plus includes free delivery on $50+; Express is reported $10 for Plus or $22 for Club, and three-hour delivery $5 or $17.", rule: "Instant Savings are account-loaded discounts, not coupons; no clipping or traditional coupon stacking.", membership: "Required: Club $60/year or Plus $120/year.", policyStatus: "verified" },
  { id: "piggly_wiggly", name: "Piggly Wiggly", short: "THE PIG", regions: ["southeast", "midwest"], orderUrl: "https://www.shopthepig.com/shop", couponUrl: "http://www.shopthepig.com/coupon-policy/", delivery: "Participating Midwest stores use Instacart; Shipt and other delivery options vary by independently owned location.", rule: "The published Midwest policy says no coupon stacking and no overage. Paper takes precedence when both paper and digital match. Acceptance varies by independently owned store—confirm locally.", membership: "Pig Point$ and digital account availability vary by location.", policyStatus: "confirm_local" },
];

const regions: Array<{ id: RegionId; label: string }> = [
  { id: "texas", label: "Texas" },
  { id: "southeast", label: "Southeast" },
  { id: "northeast", label: "Northeast" },
  { id: "midwest", label: "Midwest" },
  { id: "west", label: "West" },
  { id: "national", label: "National chains" },
];

const baselineDeals: Array<{
  externalKey: string; retailer: RetailerId; title: string; detail: string; priceLabel: string; finalPrice: number | null; unitLabel: string; couponSteps: string; validFrom: string | null; validThrough: string | null; sourceName: string; sourceUrl: string; confidence: "verified_live" | "indexed"; caveat: string | null;
}> = [
  { externalKey: "2026-10-wm-klondike", retailer: "walmart", title: "Klondike 6-packs", detail: "Buy 2 at $3.78 each, then submit eligible receipt offers.", priceLabel: "$2.56 for 2 · $1.28 each", finalPrice: 1.28, unitLabel: "6-pack", couponSteps: "Buy 2; submit $3 Ibotta and $2 Fetch offers.", validFrom: "2026-10-06", validThrough: "2026-10-12", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/06/klondike-ice-cream-bar-6-packs-as-low-as-1-24-at-walmart-or-kroger", confidence: "indexed", caveat: "This round has ended; Ibotta and Fetch amounts vary by account. Kept in the feed as an expired offer." },
  { externalKey: "2026-10-wm-pb2", retailer: "walmart", title: "PB2 peanut butter powder, 32 oz", detail: "Listed in Living Rich with Coupons' October 2026 Walmart deals roundup.", priceLabel: "$15.99 · was $29.99", finalPrice: 15.99, unitLabel: "32 oz", couponSteps: "Event price; no extra coupon stated. Confirm the current price at Walmart.com before ordering.", validFrom: "2026-10-05", validThrough: null, sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/best-walmart-deals-october-2026.html", confidence: "indexed", caveat: "The Walmart Deals event window was reported through Oct 11; event inventory and price can change or sell out." },
  { externalKey: "2026-10-wm-coffee", retailer: "walmart", title: "Maud's Fall coffee pods, 24 ct", detail: "Listed in Living Rich with Coupons' October 2026 Walmart deals roundup.", priceLabel: "$16.06 · was $22.94", finalPrice: 16.06, unitLabel: "24 ct", couponSteps: "Event price; no extra coupon stated. Confirm the current price at Walmart.com before ordering.", validFrom: "2026-10-05", validThrough: null, sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/best-walmart-deals-october-2026.html", confidence: "indexed", caveat: "The Walmart Deals event window was reported through Oct 11; event inventory and price can change or sell out." },
  { externalKey: "2026-10-heb-cheerios", retailer: "heb", title: "General Mills Cheerios, family size", detail: "H-E-B weekly deals listing.", priceLabel: "$4.97", finalPrice: 4.97, unitLabel: "family-size box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-cakemix", retailer: "heb", title: "Betty Crocker cake mix", detail: "H-E-B weekly deals listing.", priceLabel: "$1.47", finalPrice: 1.47, unitLabel: "box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-barilla", retailer: "heb", title: "Barilla spaghetti", detail: "H-E-B weekly deals listing.", priceLabel: "$1.88", finalPrice: 1.88, unitLabel: "box", couponSteps: "Weekly deals price on heb.com; no coupon stated.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Weekly deals rotate; confirm the current listing on heb.com." },
  { externalKey: "2026-10-heb-towels", retailer: "heb", title: "H-E-B paper towels coupon", detail: "Digital coupon on H-E-B brand paper towels in the weekly deals listing.", priceLabel: "$1.00 off", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon in your H-E-B account; it applies at checkout.", validFrom: "2026-10-07", validThrough: null, sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-heb-laundry", retailer: "heb", title: "Laundry care: $5 off $25", detail: "Basket coupon in the H-E-B weekly deals listing.", priceLabel: "$5 off $25 of laundry care", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon and spend $25 on eligible laundry care.", validFrom: "2026-10-07", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Threshold is calculated under H-E-B coupon rules; confirm eligible items in the listing." },
  { externalKey: "2026-10-heb-pet", retailer: "heb", title: "Pet food & litter: $5 off $30", detail: "Basket coupon in the H-E-B weekly deals listing.", priceLabel: "$5 off $30 of pet food or litter", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the digital coupon and spend $30 on eligible pet food or litter.", validFrom: "2026-10-07", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Deals", sourceUrl: "https://www.heb.com/weekly-ad/deals?cursor=94VCjK11Dhq&department=490024", confidence: "indexed", caveat: "Threshold is calculated under H-E-B coupon rules; confirm eligible items in the listing." },
  { externalKey: "2026-10-aldi-pasta", retailer: "aldi", title: "Priano bronze-cut pasta", detail: "New ALDI Find starting Oct 14 per Tasting Table's October roundup.", priceLabel: "$3.39", finalPrice: 3.39, unitLabel: "bag", couponSteps: "ALDI Finds price; no coupon needed. ALDI does not accept manufacturer coupons.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Tasting Table", sourceUrl: "https://www.tastingtable.com/2274778/best-new-aldi-products-october-2026/", confidence: "indexed", caveat: "ALDI Finds are while supplies last and can sell out early." },
  { externalKey: "2026-10-aldi-cheese", retailer: "aldi", title: "Emporium Selection Dutch cheese", detail: "New ALDI Find starting Oct 14 per Tasting Table's October roundup.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "package", couponSteps: "ALDI Finds price; no coupon needed.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Tasting Table", sourceUrl: "https://www.tastingtable.com/2274778/best-new-aldi-products-october-2026/", confidence: "indexed", caveat: "ALDI Finds are while supplies last and can sell out early." },
  { externalKey: "2026-10-aldi-pizza", retailer: "aldi", title: "Mama Cozzi's dill pickle pizza", detail: "ALDI Find arriving Oct 21 per EatingWell's October finds roundup.", priceLabel: "$6.99", finalPrice: 6.99, unitLabel: "pizza", couponSteps: "ALDI Finds price; no coupon needed.", validFrom: "2026-10-21", validThrough: "2026-10-27", sourceName: "EatingWell", sourceUrl: "https://www.eatingwell.com/aldi-finds-october-2026-12166366", confidence: "indexed", caveat: "Starts Oct 21; ALDI Finds are while supplies last." },
  { externalKey: "2026-10-united-wine", retailer: "united", title: "Wine event: extra 10% off any 6 bottles", detail: "United Supermarkets / Market Street wine event, prices effective Oct 5 – Nov 1, 2026.", priceLabel: "Save 10% on 6+ bottles (750 ml+)", finalPrice: null, unitLabel: "offer", couponSteps: "Mix and match varieties; the 10% discount applies at checkout when you buy any 6 bottles of wine 750 ml or larger.", validFrom: "2026-10-05", validThrough: "2026-11-01", sourceName: "HotCouponWorld (United ad preview)", sourceUrl: "https://www.hotcouponworld.com/unitedsupermarkets-weekly-ad/", confidence: "indexed", caveat: "From the printed United/Market Street event flyer; selection varies by store and wine is not sold at every location." },
  { externalKey: "2026-10-dg-cereal", retailer: "dollar_general", title: "General Mills cereal", detail: "Part of the Saturday coupon scenario; exact variety and size must match the digital offer.", priceLabel: "$1 each in stated scenario", finalPrice: 1, unitLabel: "item", couponSteps: "Clip the Saturday $5 off $25 and matching item digital coupons in the DG app.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Scenario pricing depends on the Saturday $5 off $25 threshold math; build the exact qualifying cart in the DG app." },
  { externalKey: "2026-10-dg-soda", retailer: "dollar_general", title: "Nine soda 12-packs", detail: "Saturday $5 off $25 scenario.", priceLabel: "$20 total · $2.22 each", finalPrice: 2.22, unitLabel: "12-pack", couponSteps: "Build the published scenario and clip the Saturday $5 off $25 coupon.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "The source did not expose the exact soda varieties and item-level coupon breakdown." },
  { externalKey: "2026-10-fd-redbaron", retailer: "family_dollar", title: "Red Baron frozen pizza", detail: "Family Dollar weekly ad, Oct 11–17: Classic Crust or Brick Oven, 17.89–23.45 oz.", priceLabel: "2 for $9 · $4.50 each", finalPrice: 4.5, unitLabel: "pizza", couponSteps: "Buy 2 eligible pizzas; the 2-for-$9 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-10-fd-prego", retailer: "family_dollar", title: "Prego pasta sauce, 23.5–24 oz", detail: "Family Dollar weekly ad, Oct 11–17.", priceLabel: "2 for $5 · $2.50 each", finalPrice: 2.5, unitLabel: "jar", couponSteps: "Buy 2 eligible jars; the 2-for-$5 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-10-kroger-cereal", retailer: "kroger", title: "General Mills cereal", detail: "Kroger weekly ad, Oct 14–20.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "box", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; participating varieties and sizes are listed in the full ad." },
  { externalKey: "2026-10-kroger-pasta", retailer: "kroger", title: "Barilla pasta", detail: "Kroger weekly ad, Oct 14–20.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "box", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible cuts in the full ad." },
  { externalKey: "2026-10-kroger-coffee", retailer: "kroger", title: "Starbucks coffee", detail: "Kroger weekly ad, Oct 14–20.", priceLabel: "$7.99", finalPrice: 7.99, unitLabel: "bag", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible sizes in the full ad." },
  { externalKey: "2026-10-kroger-bacon", retailer: "kroger", title: "Smithfield bacon", detail: "Kroger weekly ad, Oct 14–20.", priceLabel: "$4.99", finalPrice: 4.99, unitLabel: "package", couponSteps: "Weekly-ad price with your Kroger Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-kroger-milk", retailer: "kroger", title: "Kroger milk, gallon", detail: "Three-day sale, Oct 17–19, in the Kroger weekly ad.", priceLabel: "$2.49", finalPrice: 2.49, unitLabel: "gallon", couponSteps: "Three-day sale price with your Kroger Shopper's Card, Oct 17–19 only.", validFrom: "2026-10-17", validThrough: "2026-10-19", sourceName: "WeeklyAdHunters", sourceUrl: "http://weeklyadhunters.com/kroger-weekly-ad/", confidence: "indexed", caveat: "Three-day sale inside the Oct 14–20 ad week." },
  { externalKey: "2026-10-publix-sargento", retailer: "publix", title: "Sargento cheese", detail: "Publix weekly ad BOGO, Oct 15–21 (Oct 14–20 for some areas).", priceLabel: "Buy 1, get 1 free · $5.15 shelf", finalPrice: null, unitLabel: "package", couponSteps: "Buy 2 eligible packages; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; per-unit total depends on buying two. Ad dates vary by area." },
  { externalKey: "2026-10-publix-welchs", retailer: "publix", title: "Welch's juice", detail: "Publix weekly ad BOGO, Oct 15–21 (Oct 14–20 for some areas).", priceLabel: "Buy 1, get 1 free · $5.27 shelf", finalPrice: null, unitLabel: "bottle", couponSteps: "Buy 2 eligible bottles; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; ad dates vary by area." },
  { externalKey: "2026-10-publix-turkey", retailer: "publix", title: "Jennie-O ground turkey", detail: "Publix weekly ad BOGO, Oct 15–21 (Oct 14–20 for some areas).", priceLabel: "Buy 1, get 1 free · $6.99 shelf", finalPrice: null, unitLabel: "package", couponSteps: "Buy 2 eligible packages; the second rings up free at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-ad-coupons-week-of-10-15-to-10-21-10-14-to-10-20-for-some/", confidence: "indexed", caveat: "BOGO shelf price shown; ad dates vary by area." },
  { externalKey: "2026-10-safeway-salmon", retailer: "safeway", title: "Salmon portions", detail: "Safeway weekly roundup, week of Oct 9–15.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "portion", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; the listing did not state whether the price is per portion or per pound — confirm in your local ad." },
  { externalKey: "2026-10-safeway-beef", retailer: "safeway", title: "90% lean ground beef", detail: "Safeway weekly roundup, week of Oct 9–15.", priceLabel: "$6.99/lb", finalPrice: 6.99, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; prices vary by Safeway/Albertsons banner and area." },
  { externalKey: "2026-10-safeway-strawberries", retailer: "safeway", title: "Strawberries, 2 lb", detail: "Safeway weekly roundup, week of Oct 9–15.", priceLabel: "$4.99", finalPrice: 4.99, unitLabel: "2-lb package", couponSteps: "Weekly-ad price with a free Safeway for U account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAd.io", sourceUrl: "https://www.weeklyad.io/safeway", confidence: "indexed", caveat: "Regional roundup; prices vary by area." },
  { externalKey: "2026-10-target-chobani", retailer: "target", title: "Chobani yogurt 4-packs", detail: "Target weekly ad, Oct 11–17.", priceLabel: "2 for $7 · $3.50 each", finalPrice: 3.5, unitLabel: "4-pack", couponSteps: "Buy 2 eligible 4-packs; the 2-for-$7 price applies at checkout.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/target-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm eligible flavors in the full ad." },
  { externalKey: "2026-10-target-soda", retailer: "target", title: "Soda 12-packs", detail: "Target Circle Week pricing highlighted by Hip2Save.", priceLabel: "$5.33 each when you buy 3", finalPrice: 5.33, unitLabel: "12-pack", couponSteps: "Buy 3 eligible 12-packs in one trip to get the per-pack price.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "Hip2Save", sourceUrl: "https://hip2save.com/deals/target-sales-this-week/", confidence: "indexed", caveat: "Quantity threshold required; eligible brands are listed in the source roundup." },
  { externalKey: "2026-10-meijer-chicken", retailer: "meijer", title: "Family-pack chicken breast", detail: "Meijer weekly ad, Oct 14–20.", priceLabel: "$2.59/lb", finalPrice: 2.59, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-skippy", retailer: "meijer", title: "Skippy peanut butter, 16 oz", detail: "Meijer weekly ad, Oct 14–20.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "16 oz jar", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-starkist", retailer: "meijer", title: "StarKist tuna pouches", detail: "Meijer weekly ad, Oct 14–20.", priceLabel: "$1.25", finalPrice: 1.25, unitLabel: "pouch", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-folgers", retailer: "meijer", title: "Folgers coffee, 19–26 oz", detail: "Meijer weekly ad, Oct 14–20.", priceLabel: "$10.99", finalPrice: 10.99, unitLabel: "canister", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-meijer-tidycats", retailer: "meijer", title: "Tidy Cats litter, 20 lb", detail: "Meijer weekly ad, Oct 14–20.", priceLabel: "$11.49", finalPrice: 11.49, unitLabel: "20 lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-10-giant-eggs", retailer: "giant", title: "Giant large eggs", detail: "Giant Food weekly ad, Oct 9–15.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "dozen", couponSteps: "Weekly-ad price with your free GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-giant-bacon", retailer: "giant", title: "Hormel bacon", detail: "Giant Food weekly ad, Oct 9–15.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "package", couponSteps: "Weekly-ad price with your free GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-giant-chips", retailer: "giant", title: "Utz potato chips", detail: "Giant Food weekly ad, Oct 9–15.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "bag", couponSteps: "Buy 2 eligible bags; the second rings up free at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-giant-cereal", retailer: "giant", title: "General Mills cereal", detail: "Giant Food weekly ad, Oct 9–15.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "box", couponSteps: "Buy 2 eligible boxes; the second rings up free at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/giant-food-weekly-ad/", confidence: "indexed", caveat: "Shelf price was not supplied, so final total is not computed." },
  { externalKey: "2026-10-ss-honeycrisp", retailer: "stop_shop", title: "Honeycrisp apples", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "$1.49/lb", finalPrice: 1.49, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-ss-chicken", retailer: "stop_shop", title: "Chicken breast", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "$2.99/lb", finalPrice: 2.99, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-10-ss-bacon", retailer: "stop_shop", title: "Stop & Shop sliced bacon", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "package", couponSteps: "Weekly-ad price with your free GO Rewards card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the package size in the full ad." },
  { externalKey: "2026-10-ss-barilla", retailer: "stop_shop", title: "Barilla pasta", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "4 for $5 · $1.25 each", finalPrice: 1.25, unitLabel: "box", couponSteps: "Buy 4 eligible boxes to get the per-box price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; confirm eligible cuts in the full ad." },
  { externalKey: "2026-10-ss-kelloggs", retailer: "stop_shop", title: "Kellogg's cereal", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "2 for $5 · $2.50 each", finalPrice: 2.5, unitLabel: "box", couponSteps: "Buy 2 eligible boxes to get the per-box price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/stop-and-shop-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; confirm eligible varieties in the full ad." },
  { externalKey: "2026-10-fl-klondike", retailer: "food_lion", title: "Klondike bars, 4–6 ct", detail: "Food Lion weekly ad offer running through Oct 20.", priceLabel: "2 for $7 · $3.50 each", finalPrice: 3.5, unitLabel: "pack", couponSteps: "Buy 2 eligible packs; the 2-for-$7 price applies at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-20", sourceName: "SmartDealsHub", sourceUrl: "https://smartdealshub.co/food-lion/food-lion-weekly-ad-2605516&expired=true/", confidence: "indexed", caveat: "Offer dates came from the ad roundup; confirm in your local ad." },
  { externalKey: "2026-10-fl-yogurt", retailer: "food_lion", title: "Food Lion yogurt, 32 oz", detail: "Food Lion weekly ad offer.", priceLabel: "2 for $5 · $2.50 each", finalPrice: 2.5, unitLabel: "32 oz tub", couponSteps: "Buy 2 eligible tubs; the 2-for-$5 price applies at checkout.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "SmartDealsHub", sourceUrl: "https://smartdealshub.co/food-lion/food-lion-weekly-ad-2605516&expired=true/", confidence: "indexed", caveat: "Offer dates came from the ad roundup; confirm in your local ad." },
  { externalKey: "2026-10-fl-beef", retailer: "food_lion", title: "93% lean ground beef", detail: "Food Lion weekly ad MVP price, Oct 15–21.", priceLabel: "$6.99/lb with MVP", finalPrice: 6.99, unitLabel: "lb", couponSteps: "MVP card price; scan your free MVP card at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; MVP pricing requires the free MVP card." },
  { externalKey: "2026-10-fl-tenderloins", retailer: "food_lion", title: "Chicken breast tenderloins", detail: "Food Lion weekly ad MVP price, Oct 15–21.", priceLabel: "$3.49/lb with MVP", finalPrice: 3.49, unitLabel: "lb", couponSteps: "MVP card price; scan your free MVP card at checkout.", validFrom: "2026-10-15", validThrough: "2026-10-21", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; MVP pricing requires the free MVP card." },
  { externalKey: "2026-10-costco-soup", retailer: "costco", title: "Campbell's soup, 8-pack", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$7.99 after coupon-book savings", finalPrice: 7.99, unitLabel: "8-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-tide", retailer: "costco", title: "Tide laundry detergent", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$16.49 after coupon-book savings", finalPrice: 16.49, unitLabel: "bottle", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; confirm the size on the coupon-book page." },
  { externalKey: "2026-10-costco-granola", retailer: "costco", title: "Nature Valley protein bars, 30-pack", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$9.99 after coupon-book savings", finalPrice: 9.99, unitLabel: "30-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-perrier", retailer: "costco", title: "Perrier sparkling water, 24-pack", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$17.99 after coupon-book savings", finalPrice: 17.99, unitLabel: "24-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-crest", retailer: "costco", title: "Crest toothpaste, 5-pack", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$11.99 after coupon-book savings", finalPrice: 11.99, unitLabel: "5-pack", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; warehouse selection varies." },
  { externalKey: "2026-10-costco-pantene", retailer: "costco", title: "Pantene shampoo", detail: "Costco coupon book, Sep 21 – Oct 18.", priceLabel: "$9.99 after coupon-book savings", finalPrice: 9.99, unitLabel: "bottle", couponSteps: "Coupon-book savings apply automatically for members; no clipping.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/couponing/costco-coupon-book", confidence: "indexed", caveat: "Costco membership required; confirm the size on the coupon-book page." },
  { externalKey: "2026-10-sams-nutella", retailer: "sams_club", title: "Nutella peanut spread, twin pack", detail: "Highlighted in MoneyLion's Oct 10 Sam's Club grocery roundup.", priceLabel: "$9.98 · 2 × 26.5 oz", finalPrice: 9.98, unitLabel: "twin pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-10", validThrough: null, sourceName: "MoneyLion", sourceUrl: "https://www.moneylion.com/trending/money/sams-club-groceries-worth-money", confidence: "indexed", caveat: "Roundup pricing from Oct 10; Sam's Club membership required and prices can change." },
  { externalKey: "2026-10-sams-liquidiv", retailer: "sams_club", title: "Liquid I.V., 30 count", detail: "Highlighted in MoneyLion's Oct 10 Sam's Club grocery roundup.", priceLabel: "$20.98", finalPrice: 20.98, unitLabel: "30 count", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-10", validThrough: null, sourceName: "MoneyLion", sourceUrl: "https://www.moneylion.com/trending/money/sams-club-groceries-worth-money", confidence: "indexed", caveat: "Roundup pricing from Oct 10; Sam's Club membership required and prices can change." },
  { externalKey: "2026-10-pig-bananas", retailer: "piggly_wiggly", title: "Bananas", detail: "Piggly Wiggly weekly ad, Oct 14–20.", priceLabel: "$0.55/lb", finalPrice: 0.55, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Piggly Wiggly stores are independently owned; prices vary by location." },
  { externalKey: "2026-10-pig-soda", retailer: "piggly_wiggly", title: "Soda 12-packs", detail: "Piggly Wiggly weekly ad, Oct 14–20.", priceLabel: "3 for $15 · $5 each", finalPrice: 5, unitLabel: "12-pack", couponSteps: "Buy 3 eligible 12-packs to get the per-pack price.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  { externalKey: "2026-10-pig-lunchables", retailer: "piggly_wiggly", title: "Lunchables", detail: "Piggly Wiggly weekly ad, Oct 14–20.", priceLabel: "2 for $3 · $1.50 each", finalPrice: 1.5, unitLabel: "pack", couponSteps: "Buy 2 eligible packs to get the per-pack price.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  // Week of Oct 13–19, 2026 coupon haul (researched Oct 13, 2026) — 8–10
  // sourced deals per store. Every value, date, and caveat below comes from
  // the cited source; where a source states no end date, validThrough stays
  // null and the caveat says so. See DATA-PLAN.md for the source list.
  { externalKey: "2026-w42-wm-tylenol", retailer: "walmart", title: "Tylenol 8 Hour Arthritis Pain", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12.", priceLabel: "$0.27 · was $4.97", finalPrice: 0.27, unitLabel: "bottle", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Rollback/clearance pricing varies by store, can sell out, and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-pur-gum", retailer: "walmart", title: "PUR Gum", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12.", priceLabel: "$1.00 · was $4.99", finalPrice: 1, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-sheba", retailer: "walmart", title: "Sheba Premium Purees cat food", detail: "Freebie listing in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "FREE · was $2.68", finalPrice: 0, unitLabel: "pack", couponSteps: "Listed as a freebie; no coupon stated in the source. Confirm availability in the Walmart app.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Freebie listings end without notice; the source listed no end date." },
  { externalKey: "2026-w42-wm-pillsbury-dough", retailer: "walmart", title: "Pillsbury cookie dough packs", detail: "Two packs at the deal price in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "2 for $1.80 · $0.90 each (was $8.78 for 2)", finalPrice: 0.9, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-king-arthur", retailer: "walmart", title: "King Arthur Soft Golden Roll & Bun Mix", detail: "Posted in The Krazy Coupon Lady's extreme-couponing feed.", priceLabel: "$0.96 · was $3.96", finalPrice: 0.96, unitLabel: "box", couponSteps: "Deal price; no coupon stated. Confirm the current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/deals/extreme-couponing", confidence: "indexed", caveat: "Deal-feed pricing varies by store and can disappear at any time; the source listed no end date." },
  { externalKey: "2026-w42-wm-ground-beef", retailer: "walmart", title: "Ground beef value pack", detail: "Posted in The Krazy Coupon Lady's Walmart deal feed around Oct 12; the listing did not state the pack size.", priceLabel: "$19.94 · was $24.94", finalPrice: 19.94, unitLabel: "pack", couponSteps: "Deal price; no coupon stated. Confirm the pack size and current price in the Walmart app before ordering.", validFrom: "2026-10-12", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/walmart", confidence: "indexed", caveat: "Pack size was not stated in the source; meat pricing varies by store and can change at any time." },
  { externalKey: "2026-w42-wm-no7", retailer: "walmart", title: "No7 beauty products: $5 off", detail: "Sponsored in-store QR-code coupon; example items priced $18.97–$25.97 ring up about $13.97–$20.97 after the coupon.", priceLabel: "$5 off 1 No7 product", finalPrice: null, unitLabel: "coupon", couponSteps: "Scan the No7 promo QR code in store before checkout; the $5 coupon comes off one item. Limit one per customer.", validFrom: "2026-10-11", validThrough: "2026-11-01", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/11/save-5-on-no7-beauty-products-at-walmart", confidence: "indexed", caveat: "Sponsored offer valid through Nov 1, 2026; one-time use per customer." },
  { externalKey: "2026-w42-heb-tortillas", retailer: "heb", title: "FREE H-E-B Mi Tienda Tortillas, 20 ct", detail: "H-E-B Meal Deal: buy 2 H-E-B Mi Tienda fully cooked fajitas (chicken 26 oz or beef 16 oz), get the tortillas free.", priceLabel: "FREE with Meal Deal purchase", finalPrice: 0, unitLabel: "20-ct pack", couponSteps: "Buy 2 qualifying Mi Tienda fajitas in one trip; the H-E-B Meal Deal coupon makes the 20-ct tortillas free. Unlimited use while the deal runs.", validFrom: "2026-10-14", validThrough: null, sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "The source lists this Meal Deal as expiring 'Tuesday' without a printed date; confirm it is still live in the H-E-B app." },
  { externalKey: "2026-w42-heb-zyrtec", retailer: "heb", title: "Zyrtec 24–60 ct: $5 off", detail: "Example from the source: the 30-ct size at $19.97 drops to $14.97 after the digital coupon.", priceLabel: "$5 off 1 adult Zyrtec (24–60 ct)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $5/1 any adult Zyrtec 24–60 ct digital coupon in the H-E-B app or on heb.com. Limit 1 per customer; excludes trial and travel sizes.", validFrom: "2026-10-13", validThrough: "2026-10-24", sourceName: "Saving Our Way", sourceUrl: "https://www.savingourway.com/post/h-e-b-digital-coupon-on-zyrtec", confidence: "indexed", caveat: "Digital coupon expires Oct 24, 2026; final price depends on the size you buy." },
  { externalKey: "2026-w42-heb-huggies", retailer: "heb", title: "Huggies, Pull-Ups, or Goodnites: $7 off", detail: "H-E-B digital coupon in the weekly 'can't miss coupons' set.", priceLabel: "$7 off Huggies / Pull-Ups / Goodnites", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $7 H-E-B digital coupon in the app or on heb.com and buy qualifying Huggies, Pull-Ups, or Goodnites. Unlimited use while the coupon runs.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "Coupon expires Oct 20, 2026 per the source." },
  { externalKey: "2026-w42-heb-candy", retailer: "heb", title: "Halloween candy variety bags: $5 off 2", detail: "Reese's, Hershey's, Kit Kat, or Jolly Rancher variety bags, 55–120 ct.", priceLabel: "$5 off 2 candy variety bags", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the H-E-B digital coupon and buy 2 qualifying Halloween candy variety bags (55–120 ct).", validFrom: "2026-10-14", validThrough: "2026-10-27", sourceName: "H-E-B Weekly Ad", sourceUrl: "https://www.heb.com/collections/weekly-ad?N=490024&int=coupon-home-shortcuts-weekly-ad", confidence: "indexed", caveat: "Coupon expires Oct 27, 2026 per the source." },
  { externalKey: "2026-w42-heb-pampers-wipes", retailer: "heb", title: "FREE Pampers Baby Wipes, 52–72 ct", detail: "Free wipes with a Pampers or Luvs box diaper purchase (36–168 ct), per The Krazy Coupon Lady's coupon roundup.", priceLabel: "FREE with box diaper purchase", finalPrice: 0, unitLabel: "wipes pack", couponSteps: "Buy Pampers or Luvs box diapers (36–168 ct); the H-E-B store coupon makes the 52–72 ct Pampers wipes free. The source also lists $1/1 Luvs jumbo-bag and $3/1 Luvs box H-E-B digitals.", validFrom: "2026-10-13", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons/luvs", confidence: "indexed", caveat: "The source listed no end date; store coupons can end early — confirm in the H-E-B app before shopping." },
  { externalKey: "2026-w42-aldi-raspberries", retailer: "aldi", title: "Raspberries", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$1.49", finalPrice: 1.49, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad. The Oct 14–20 ad had not been posted by any source checked on Oct 13 — recorded as found, not replaced with invented prices." },
  { externalKey: "2026-w42-aldi-tenderloins", retailer: "aldi", title: "Chicken tenderloins", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$2.09/lb", finalPrice: 2.09, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-potstickers", retailer: "aldi", title: "Chicken potstickers", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$3.99", finalPrice: 3.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-granny-smith", retailer: "aldi", title: "Granny Smith apples", detail: "ALDI weekly ad price, Oct 7–13; the listing did not state the package size. ALDI accepts no manufacturer coupons.", priceLabel: "$2.99", finalPrice: 2.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-fried-rice", retailer: "aldi", title: "Chicken fried rice", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$5.99", finalPrice: 5.99, unitLabel: "package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-pork-belly", retailer: "aldi", title: "Pork belly", detail: "ALDI weekly ad price, Oct 7–13 (the source suggests it for burnt ends). ALDI accepts no manufacturer coupons.", priceLabel: "$2.99/lb", finalPrice: 2.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/tips/store-hacks/aldi-weekly-ads", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-blackberries", retailer: "aldi", title: "Blackberries, 6 oz", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$1.79", finalPrice: 1.79, unitLabel: "6 oz package", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/aldi-ad/", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-aldi-chicken-thighs", retailer: "aldi", title: "Boneless skinless chicken thighs", detail: "ALDI weekly ad price, Oct 7–13. ALDI accepts no manufacturer coupons.", priceLabel: "$2.49/lb", finalPrice: 2.49, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon needed or accepted.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/aldi-ad/", confidence: "indexed", caveat: "From ALDI's Oct 7–13 ad; the Oct 14–20 ad had not been posted by any source checked on Oct 13." },
  { externalKey: "2026-w42-united-chicken", retailer: "united", title: "Open Nature whole chicken", detail: "United Supermarkets weekly ad, Oct 8–15 (Texas regional chain).", priceLabel: "$2.49/lb", finalPrice: 2.49, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; no coupon-blog matchup coverage was found for United, so no stacking scenario is shown." },
  { externalKey: "2026-w42-united-turkey", retailer: "united", title: "Signature Farms lean ground turkey, 16 oz", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "$4.49", finalPrice: 4.49, unitLabel: "16 oz pack", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-nabisco", retailer: "united", title: "Nabisco party-size cookies or crackers", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "$2.50", finalPrice: 2.5, unitLabel: "party-size pack", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-dawn", retailer: "united", title: "Dawn dish soap, 70 oz", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "$9.99", finalPrice: 9.99, unitLabel: "70 oz bottle", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/wide-range-of-offers-1522340/6/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-ham", retailer: "united", title: "Whole sliced ham: buy 1, get 1 free", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "ham", couponSteps: "Buy 2 eligible hams; the second rings up free at checkout. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Shelf price was not supplied, so no per-ham total is computed." },
  { externalKey: "2026-w42-united-lemons", retailer: "united", title: "Fresh lemons", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "4 for $1.00 · $0.25 each", finalPrice: 0.25, unitLabel: "lemon", couponSteps: "Buy 4 lemons to get the per-lemon price. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-oranges", retailer: "united", title: "Navel oranges", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "$0.99/lb", finalPrice: 0.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-salad-kits", retailer: "united", title: "Taylor Farms broccoli salad kits", detail: "United Supermarkets weekly ad, Oct 8–15.", priceLabel: "2 for $7 · $3.50 each", finalPrice: 3.5, unitLabel: "kit", couponSteps: "Buy 2 eligible kits to get the per-kit price. No coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-15", sourceName: "MyDeals365", sourceUrl: "https://mydeals365.com/united-supermarkets/united-supermarkets-weekly-ad-3307370/4/", confidence: "indexed", caveat: "Weekly-ad roundup; confirm in your local United ad." },
  { externalKey: "2026-w42-united-online", retailer: "united", title: "Online orders: $30 off $75+", detail: "Recurring United Supermarkets online promo code tracked by SimplyCodes.", priceLabel: "$30 off a $75+ online order", finalPrice: null, unitLabel: "offer", couponSteps: "Enter the current promo code from the source page at online checkout on a $75+ order.", validFrom: "2026-10-13", validThrough: null, sourceName: "SimplyCodes", sourceUrl: "https://simplycodes.com/store/unitedsupermarkets.com", confidence: "indexed", caveat: "The source tracked this code as active in 7 of the last 8 months; confirm it still applies before counting on it. United's free forU program also earns points on groceries and gas." },
  { externalKey: "2026-w42-dg-colgate", retailer: "dollar_general", title: "Colgate toothpaste: $1 Saturday stack", detail: "Part of The Krazy Coupon Lady's Dollar General Saturday scenario for Oct 17.", priceLabel: "$1 each in the Saturday scenario", finalPrice: 1, unitLabel: "tube", couponSteps: "Clip the Saturday $5 off $25 digital in the myDG app and build the published scenario cart; the $5/$25 applies after item coupons under DG threshold math.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Saturday-only scenario pricing; exact varieties and sizes must match the digital offers in your myDG account." },
  { externalKey: "2026-w42-dg-airwick", retailer: "dollar_general", title: "Air Wick warmer: $1 Saturday stack", detail: "Part of The Krazy Coupon Lady's Dollar General Saturday scenario for Oct 17.", priceLabel: "$1 each in the Saturday scenario", finalPrice: 1, unitLabel: "warmer", couponSteps: "Clip the Saturday $5 off $25 digital in the myDG app and build the published scenario cart with the matching item digital.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Saturday-only scenario pricing; digital coupons can end early." },
  { externalKey: "2026-w42-dg-irish-spring", retailer: "dollar_general", title: "Irish Spring body wash", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$3.35 · $5.35 shelf − $2 digital", finalPrice: 3.35, unitLabel: "bottle", couponSteps: "Clip the $2 Irish Spring DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-febreze-plug", retailer: "dollar_general", title: "Febreze Plug refill, 2-pack", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$5.00 · $10 shelf − $5 digital", finalPrice: 5, unitLabel: "2-pack", couponSteps: "Clip the $5 Febreze Plug DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-febreze-small", retailer: "dollar_general", title: "Febreze Small Spaces", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$1.50 · $3.50 shelf − $2 digital", finalPrice: 1.5, unitLabel: "unit", couponSteps: "Clip the $2 Febreze Small Spaces DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-energizer", retailer: "dollar_general", title: "Energizer Max AA/AAA, 4-pack", detail: "Sale price minus a DG digital coupon, per Living Rich with Coupons.", priceLabel: "$2.50 · $5.50 shelf − $3 digital", finalPrice: 2.5, unitLabel: "4-pack", couponSteps: "Clip the $3 Energizer DG digital coupon in the myDG app before checkout.", validFrom: "2026-10-12", validThrough: "2026-10-17", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/new-5-25-dollar-general-coupon-soda-12-packs-just-3-45-each-just-use-your-phone-10-10-only.html", confidence: "indexed", caveat: "Digital coupons can end early; confirm the offer is in your myDG account." },
  { externalKey: "2026-w42-dg-household-scenario", retailer: "dollar_general", title: "Saturday scenario: 8 household staples for $8", detail: "Suavitel, Fabuloso, Softsoap refill, Palmolive, OxiClean spray, Arm & Hammer scent beads, and 2 Snuggle — stacked with item digitals, Colgate-Palmolive $5/$15 instant savings, and the Saturday $5 off $25.", priceLabel: "$8 total for 8 items in the published scenario", finalPrice: null, unitLabel: "scenario", couponSteps: "Clip every item digital in the myDG app (Suavitel −$2, Fabuloso −$0.75, Softsoap −$2, Palmolive −$1, OxiClean −$2, Arm & Hammer beads −$2, Snuggle −$4/2), buy all 8 items on Saturday, and let the $5/$15 instant savings and the $5/$25 store coupon apply at checkout.", validFrom: "2026-10-13", validThrough: "2026-10-17", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/07/dollar-general-saturday-deals-1-general-mills-cereal-colgate-more", confidence: "indexed", caveat: "Scenario math per DG stacking rules in the source; every digital must be clipped and available in your account, and the $5/$25 is Saturday Oct 17 only." },
  { externalKey: "2026-w42-fd-gain", retailer: "family_dollar", title: "Gain laundry products: $5 off Smart Coupon", detail: "Covers Gain liquid 81 oz, fabric softener 100 oz, scent boosters, or dryer sheets; weekly ad Oct 11–17 plus Smart Coupons.", priceLabel: "$5 off Gain laundry products", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $5 Gain Smart Coupon to your Family Dollar account and buy a qualifying Gain laundry product; Smart Coupons apply in store.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-arm-hammer", retailer: "family_dollar", title: "Arm & Hammer laundry: $4 off Smart Coupon", detail: "Arm & Hammer liquid 96.2–110 oz or Power Paks 42 ct; weekly ad Oct 11–17 plus Smart Coupons.", priceLabel: "$4 off Arm & Hammer laundry", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $4 Arm & Hammer Smart Coupon to your Family Dollar account and buy the 96.2–110 oz liquid or 42-ct Power Paks.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-dawn", retailer: "family_dollar", title: "Dawn Platinum: $2 off Smart Coupon", detail: "Dawn Platinum EZ-Squeeze 24 oz or Power Suds 17.4 oz; weekly ad Oct 11–17 plus Smart Coupons.", priceLabel: "$2 off Dawn Platinum", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Dawn Platinum Smart Coupon to your Family Dollar account and buy the EZ-Squeeze 24 oz or Power Suds 17.4 oz.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-downy", retailer: "family_dollar", title: "Downy: $2 off Smart Coupon", detail: "Downy liquid 56/100 oz or scent boosters; weekly ad Oct 11–17 plus Smart Coupons.", priceLabel: "$2 off Downy products", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Downy Smart Coupon to your Family Dollar account and buy a qualifying Downy liquid or scent booster.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Smart Coupons are in-store only; confirm the coupon is in your account before shopping." },
  { externalKey: "2026-w42-fd-pizza-coupon", retailer: "family_dollar", title: "DiGiorno or Tombstone pizza: $1 off 2", detail: "Family Dollar digital coupon running Oct 1–31, 2026.", priceLabel: "$1 off 2 frozen pizzas", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $1 off 2 DiGiorno/Tombstone digital coupon and buy 2 qualifying pizzas. Per the source it stacks on the pizza category's 2-for-$9 ad pricing (Red Baron).", validFrom: "2026-10-01", validThrough: "2026-10-31", sourceName: "Family Dollar", sourceUrl: "https://www.familydollar.com/coupon-details", confidence: "indexed", caveat: "Digital coupon expires Oct 31, 2026; confirm it is clipped to your account." },
  { externalKey: "2026-w42-fd-coke", retailer: "family_dollar", title: "Coca-Cola 6-packs, 16.9 oz", detail: "Family Dollar weekly ad, Oct 11–17.", priceLabel: "$4 each when you buy 4", finalPrice: 4, unitLabel: "6-pack", couponSteps: "Buy 4 eligible 6-packs in one trip to get the $4 per-pack price. No coupon stated.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Quantity threshold required; the same ad lists Dr Pepper 12-packs 3 for $17, Doritos 2 for $7, and Lay's 3 for $7." },
  { externalKey: "2026-w42-fd-scott", retailer: "family_dollar", title: "Scott paper products", detail: "Scott Choose-A-Sheet 6 rolls or Comfort Plus bath tissue 6/12 rolls; weekly ad Oct 11–17.", priceLabel: "2 for $8 · $4 each", finalPrice: 4, unitLabel: "pack", couponSteps: "Buy 2 eligible Scott packs; the 2-for-$8 price applies at checkout. No coupon stated.", validFrom: "2026-10-11", validThrough: "2026-10-17", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/family-dollar-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm the price at your local store." },
  { externalKey: "2026-w42-kroger-salsa", retailer: "kroger", title: "Salsa: FREE", detail: "Lead deal in The Krazy Coupon Lady's Top 10 Kroger deals for the Oct 14–20 ad week.", priceLabel: "FREE · was $4.99", finalPrice: 0, unitLabel: "jar", couponSteps: "Follow the digital/coupon combination in the source post exactly; clip the required Kroger digital before shopping.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Digital coupons can be removed at any time; the exact brand and size are in the source post." },
  { externalKey: "2026-w42-kroger-yakisoba", retailer: "kroger", title: "Maruchan Yakisoba noodle packs", detail: "Two packs at the deal price in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14–20.", priceLabel: "$0.39 for 2 · about $0.20 each (was $2.78 for 2)", finalPrice: 0.2, unitLabel: "pack", couponSteps: "Buy 2 Maruchan Yakisoba packs and use the $1/2 Maruchan digital coupon clipped to your Shopper's Card.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Digital coupon required; per-pack math rounds the $0.39 two-pack total." },
  { externalKey: "2026-w42-kroger-hellmanns", retailer: "kroger", title: "Hellmann's mayonnaise", detail: "Coupon-plus-rebate stack in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14–20.", priceLabel: "$0.65 after coupon + rebate (pay $3.29)", finalPrice: 0.65, unitLabel: "jar", couponSteps: "Pay $3.29 at checkout with the $2/1 Hellmann's digital coupon clipped, then submit the $2 Fetch Rewards rebate offer.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Fetch rebate amounts vary by account; you pay $3.29 at the register and get the rest back as a rebate." },
  { externalKey: "2026-w42-kroger-grands", retailer: "kroger", title: "Pillsbury Grands! biscuit tubes", detail: "Two tubes at the deal price in The Krazy Coupon Lady's Kroger feed, Oct 14–20.", priceLabel: "$1.49 each when you buy 2 (was $6.78 for 2)", finalPrice: 1.49, unitLabel: "tube", couponSteps: "Buy 2 eligible Pillsbury Grands! tubes with your Shopper's Card; the sale price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/kroger", confidence: "indexed", caveat: "Weekly deal-feed price; participating varieties are listed in the source." },
  { externalKey: "2026-w42-kroger-tillamook", retailer: "kroger", title: "Tillamook cheese", detail: "Two packages at the deal price in The Krazy Coupon Lady's Kroger feed, Oct 14–20.", priceLabel: "2 for $4.59 · about $2.30 each (was $9.18 for 2)", finalPrice: 2.3, unitLabel: "package", couponSteps: "Buy 2 eligible Tillamook cheeses with your Shopper's Card; the sale price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/kroger", confidence: "indexed", caveat: "Weekly deal-feed price; per-package math rounds the $4.59 two-pack total." },
  { externalKey: "2026-w42-kroger-arm-hammer", retailer: "kroger", title: "Arm & Hammer laundry detergent", detail: "Digital-coupon price in The Krazy Coupon Lady's Top 10 Kroger deals, Oct 14–20; the same post lists $2 cash back on Persil.", priceLabel: "$4.50 after $2/1 digital coupon", finalPrice: 4.5, unitLabel: "bottle", couponSteps: "Clip the $2/1 Arm & Hammer digital coupon to your Shopper's Card and buy the qualifying detergent.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/2026/10/08/top-10-must-do-kroger-deals-free-salsa-0-65-hellmanns-mayo-and-more", confidence: "indexed", caveat: "Kroger's Mega Event (buy 5+, save $1 each) and 33%-off Halloween candy digital also run Oct 14–20 per Kroger Krazy and KCL; see the sources for item lists." },
  { externalKey: "2026-w42-kroger-deal-days", retailer: "kroger", title: "Deal Days: $30 off $75+ pickup or delivery", detail: "Kroger Deal Days digital coupon, running through Oct 20 per Hip2Save.", priceLabel: "$30 off a $75+ pickup/delivery order", finalPrice: null, unitLabel: "offer", couponSteps: "Clip the Deal Days digital coupon to your Shopper's Card and place a $75+ pickup or delivery order; per the source it stacks with other Kroger digitals.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Hip2Save", sourceUrl: "https://hip2save.com/deals/kroger-deal-days/", confidence: "indexed", caveat: "Online orders only; coupon must be clipped before ordering." },
  { externalKey: "2026-w42-publix-pringles", retailer: "publix", title: "Pringles potato crisps, 5.2/5.5 oz", detail: "BOGO plus printable coupon stack from iHeartPublix, ad week Oct 8–14.", priceLabel: "$1.02 per can when you buy 2", finalPrice: 1.02, unitLabel: "can", couponSteps: "Buy 2 cans on BOGO ($2.79 shelf) and use the $0.75/2 Pringles printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/get-cans-of-pringles-potato-crisps-for-just-1-02-each/", confidence: "indexed", caveat: "Publix ad dates vary slightly by region (some areas run a day earlier); printable coupons can run out." },
  { externalKey: "2026-w42-publix-progresso", retailer: "publix", title: "Progresso broth, 32 oz", detail: "BOGO plus digital coupon stack from iHeartPublix, ad week Oct 8–14.", priceLabel: "$1.15 per carton when you buy 4", finalPrice: 1.15, unitLabel: "carton", couponSteps: "Buy 4 cartons on BOGO ($2.79 shelf) and use the $1/4 Progresso/Old El Paso Publix digital coupon — or a $1/4 Ibotta offer; the two cannot combine.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/get-cartons-of-progresso-broth-for-just-1-15-at-publix/", confidence: "indexed", caveat: "Publix ad dates vary slightly by region; choose the digital or Ibotta — not both." },
  { externalKey: "2026-w42-publix-arm-hammer", retailer: "publix", title: "Arm & Hammer laundry detergent", detail: "BOGO plus Publix digital stack from iHeartPublix, ad week Oct 8–14 (liquid, unit dose, or sheets).", priceLabel: "As low as $1.05 after BOGO + digital", finalPrice: 1.05, unitLabel: "bottle", couponSteps: "Buy on BOGO ($6.10–$7.49 shelf) and use the $2/1 Arm & Hammer Publix digital coupon clipped to your Club Publix account.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/grab-arm-hammer-laundry-detergent-as-low-as-1-05-at-publix-5/", confidence: "indexed", caveat: "Final price depends on which BOGO shelf price your store runs; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-oscar-mayer", retailer: "publix", title: "Oscar Mayer Deli Fresh lunch meat", detail: "BOGO plus Ibotta stack in iHeartPublix's Super Deals, ad week Oct 8–14.", priceLabel: "$1.60 after Ibotta cash back", finalPrice: 1.6, unitLabel: "package", couponSteps: "Buy on BOGO ($6.19 shelf), then submit the $1.50/1 Ibotta deposit (limit 5).", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "You pay the BOGO price at the register; the $1.60 figure is after Ibotta cash back. Ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-siggis", retailer: "publix", title: "Siggi's skyr yogurt cups", detail: "BOGO plus printable coupon stack in iHeartPublix's Super Deals, ad week Oct 8–14.", priceLabel: "As low as $0.50 per cup", finalPrice: 0.5, unitLabel: "cup", couponSteps: "Buy 4–8 oz cups on BOGO ($2–$2.50 shelf) and use the $1/2 Siggi's printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "The 24 oz cup runs BOGO $6.99 with the same printable, about $3 each; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-country-crock", retailer: "publix", title: "Country Crock spread or plant butter", detail: "BOGO plus printable coupon stack in iHeartPublix's Super Deals, ad week Oct 8–14.", priceLabel: "As low as $0.33 after BOGO + coupon", finalPrice: 0.33, unitLabel: "tub", couponSteps: "Buy on BOGO and use the $1.50/1 Country Crock printable coupon.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "Lowest figure assumes the lowest BOGO shelf price in the source; ad dates vary slightly by region." },
  { externalKey: "2026-w42-publix-digiorno", retailer: "publix", title: "DiGiorno stuffed crust pizzas", detail: "Two pizzas at the deal price in iHeartPublix's Super Deals, ad week Oct 8–14.", priceLabel: "2 for $9.29 · $4.65 each (was $23.58 for 2)", finalPrice: 4.65, unitLabel: "pizza", couponSteps: "Buy 2 DiGiorno stuffed crust pizzas at the ad price; no extra coupon stated.", validFrom: "2026-10-08", validThrough: "2026-10-14", sourceName: "iHeartPublix", sourceUrl: "https://www.iheartpublix.com/2026/10/publix-super-deals-week-of-10-8-to-10-14-10-7-to-10-13-for-some/", confidence: "indexed", caveat: "Ad dates vary slightly by region; per-pizza math splits the $9.29 two-pizza total." },
  { externalKey: "2026-w42-safeway-honeycrisp", retailer: "safeway", title: "Honeycrisp apples", detail: "Safeway/Albertsons for U digital price in the ad week ending Oct 13.", priceLabel: "$0.97/lb with for U", finalPrice: 0.97, unitLabel: "lb", couponSteps: "Clip the for U digital offer to your free Safeway/Albertsons account before shopping.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; couponing sources had not yet covered the ad starting Oct 14 — check the for U app for the new week." },
  { externalKey: "2026-w42-safeway-ribs", retailer: "safeway", title: "Pork ribs: back, spare, or St. Louis-style", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$2.77/lb", finalPrice: 2.77, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account; no coupon stated.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked — confirm in the for U app." },
  { externalKey: "2026-w42-safeway-haagen", retailer: "safeway", title: "Häagen-Dazs ice cream or treats", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$2.47 each when you buy 2", finalPrice: 2.47, unitLabel: "carton", couponSteps: "Buy 2 eligible Häagen-Dazs items with your for U account to get the per-item price.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked — confirm in the for U app." },
  { externalKey: "2026-w42-safeway-chicken", retailer: "safeway", title: "Boneless skinless chicken breasts", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price with a free Safeway for U account; no coupon stated.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked — confirm in the for U app." },
  { externalKey: "2026-w42-safeway-quaker", retailer: "safeway", title: "Quaker cereal, oatmeal, or Chewy bars", detail: "Safeway/Albertsons weekly ad price in the week ending Oct 13; the same roundup listed Bartlett pears, a 5-lb bag of Signature Select russets, and a 3-lb bag of yellow onions at $0.99 each.", priceLabel: "$1.99 each (first 4)", finalPrice: 1.99, unitLabel: "box", couponSteps: "Weekly-ad price with a free Safeway for U account; the $1.99 price applies to the first 4 items.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "From the ad week ending Oct 13; the new week's ad was not yet covered by the sources checked — confirm in the for U app." },
  { externalKey: "2026-w42-safeway-folgers", retailer: "safeway", title: "Folgers coffee: buy 1, get 1 free", detail: "Safeway/Albertsons weekly ad offer in the week ending Oct 13.", priceLabel: "Buy 1, get 1 free", finalPrice: null, unitLabel: "canister", couponSteps: "Buy 2 eligible Folgers canisters with your for U account; the second rings up free.", validFrom: "2026-10-07", validThrough: "2026-10-13", sourceName: "Alicia's Deals in AZ", sourceUrl: "https://dealsinaz.com/2026/10/07/my-favorite-deals-at-the-grocery-stores-this-week-its-senior-discount-day-prices-good-through-10-13/", confidence: "indexed", caveat: "Shelf price was not supplied, so no per-canister total is computed. From the ad week ending Oct 13." },
  { externalKey: "2026-w42-target-oxiclean", retailer: "target", title: "OxiClean MaxForce stain remover", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.42 · was $3.49", finalPrice: 1.42, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; Circle offers are account-specific and manufacturer coupons are one-time use — the source listed no end date." },
  { externalKey: "2026-w42-target-poise", retailer: "target", title: "Poise Ultra Thin Pads", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$3.89 · was $6.59", finalPrice: 3.89, unitLabel: "pack", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-degree", retailer: "target", title: "Degree antiperspirant", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$2.84 · was $4.99", finalPrice: 2.84, unitLabel: "stick", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-dove", retailer: "target", title: "Dove Bond Strength shampoo", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$2.75 · was $4.89", finalPrice: 2.75, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-dawn", retailer: "target", title: "Dawn Ultra EZ Squeeze or Platinum dish soap", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.89 · was $3.99", finalPrice: 1.89, unitLabel: "bottle", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-febreze", retailer: "target", title: "Febreze Bathroom air freshener", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$1.61 · was $3.69", finalPrice: 1.61, unitLabel: "unit", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early." },
  { externalKey: "2026-w42-target-colgate", retailer: "target", title: "Colgate oral care", detail: "Final prices after Target Circle plus manufacturer coupons in the Target app, per The Krazy Coupon Lady.", priceLabel: "360 toothbrush $1.42 · Max Fresh toothpaste $1.89", finalPrice: 1.42, unitLabel: "item", couponSteps: "Clip the Target Circle offers and the one-time manufacturer coupons in the Target app before checkout; the toothbrush was $3.49 and the toothpaste $3.99 before offers.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; offers are account-specific and can end early. Final price shown is for the toothbrush." },
  { externalKey: "2026-w42-target-swiffer", retailer: "target", title: "Swiffer Heavy Duty Duster Kit", detail: "Final price after Target Circle plus the manufacturer coupon in the Target app, per The Krazy Coupon Lady.", priceLabel: "$4.74 · was $9.99", finalPrice: 4.74, unitLabel: "kit", couponSteps: "Clip the Target Circle offer and the one-time manufacturer coupon in the Target app before checkout.", validFrom: "2026-10-11", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/target", confidence: "indexed", caveat: "From KCL's Target deal feed checked Oct 13; KCL also lists a one-time 25% off one toy or kids' book Circle coupon (clip Oct 11–Nov 14) on its Target hacks page." },
  { externalKey: "2026-w42-meijer-apples", retailer: "meijer", title: "Local apples (tote bag)", detail: "Meijer weekly ad, Oct 14–20 (Green Bay/Howard store roundup); the same ad lists 5-lb russet potatoes and 3-lb yellow onions at $2.49 each.", priceLabel: "$0.99/lb", finalPrice: 0.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-potatoes", retailer: "meijer", title: "Russet potatoes, 5-lb bag", detail: "Meijer weekly ad, Oct 14–20; 3-lb yellow onions are also $2.49 in the same ad.", priceLabel: "$2.49 per 5-lb bag", finalPrice: 2.49, unitLabel: "5-lb bag", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-carrots", retailer: "meijer", title: "Baby carrots, 1 lb (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14–20; a Buy 5, Save $5 participating item (2,000+ items this week). Little Potato Co. creamer potatoes (3 lb) are $3.99 as a Buy5 item in the same ad.", priceLabel: "$0.39 with Buy 5, Save $5", finalPrice: 0.39, unitLabel: "1-lb bag", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup — confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-sargento", retailer: "meijer", title: "Sargento cheese (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14–20; a Buy 5, Save $5 participating item.", priceLabel: "$1.99 with Buy 5, Save $5", finalPrice: 1.99, unitLabel: "package", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup — confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-egglands", retailer: "meijer", title: "Eggland's Best eggs (Buy 5, Save $5)", detail: "Meijer weekly ad, Oct 14–20; a Buy 5, Save $5 participating item. Daisy sour cream (24 oz) is $2.69 as a Buy5 item in the same ad.", priceLabel: "$2.79 with Buy 5, Save $5", finalPrice: 2.79, unitLabel: "dozen", couponSteps: "Buy any 5 participating Buy 5, Save $5 items in one trip; the per-item price reflects the event discount.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Requires 5 participating items; regional weekly-ad roundup — confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-pork", retailer: "meijer", title: "Whole pork shoulder butt", detail: "Meijer weekly ad, Oct 14–20; pork loin assorted chops are $1.79/lb in the same ad.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price; no coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Regional weekly-ad roundup; confirm your local Meijer ad." },
  { externalKey: "2026-w42-meijer-15-off-150", retailer: "meijer", title: "Meijer: $15 off $150 digital coupon", detail: "mPerks digital coupon highlighted in the Wisconsin Consumer weekly roundup.", priceLabel: "$15 off a $150 order", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $15 off $150 digital coupon in your mPerks account; per the source it can be used up to 3 times.", validFrom: "2026-10-14", validThrough: "2026-11-03", sourceName: "Wisconsin Consumer", sourceUrl: "https://wisconsinconsumer.com/2026/10/12/meijer-weekly-sales-10-14-10-20-here-are-my-favorite-deals-of-the-week/", confidence: "indexed", caveat: "Coupon expires Nov 3, 2026 per the source; threshold calculated under mPerks terms." },
  { externalKey: "2026-w42-giant-cheese", retailer: "giant", title: "Giant brand shredded or chunk cheese", detail: "Giant Food deal, Oct 9–15, from ForTheMommas.", priceLabel: "$1.77 each when you buy 4", finalPrice: 1.77, unitLabel: "package", couponSteps: "Buy 4 Giant brand shredded or chunk cheeses; the per-package price applies at checkout. No coupon needed.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/category/store-deals/giant-food-store", confidence: "indexed", caveat: "Quantity threshold required; deals stack with Giant digital coupons and Flexible Rewards gas points per the source." },
  { externalKey: "2026-w42-giant-birdseye", retailer: "giant", title: "Birds Eye Premium Vegetables", detail: "Giant Food deal, Oct 9–15, from ForTheMommas.", priceLabel: "$1.75 each · $2.00 wyb 4 − $1/4 digital", finalPrice: 1.75, unitLabel: "bag", couponSteps: "Buy 4 at $2.00 each and use the $1/4 Giant digital coupon clipped to your GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/category/store-deals/giant-food-store", confidence: "indexed", caveat: "Digital coupon required; confirm the offer is clipped before shopping." },
  { externalKey: "2026-w42-giant-ben-jerrys", retailer: "giant", title: "Ben & Jerry's pints", detail: "Giant Food deal, Oct 9–15, from ForTheMommas.", priceLabel: "$3.00 each · $4.00 − $2/2 digital", finalPrice: 3, unitLabel: "pint", couponSteps: "Buy 2 pints at $4.00 each and use the $2/2 Giant digital coupon clipped to your GIANT Card.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Digital coupon required; confirm the offer is clipped before shopping." },
  { externalKey: "2026-w42-giant-ragu", retailer: "giant", title: "Ragu sauce or San Giorgio / Mueller's pasta", detail: "Giant Food deal, Oct 9–15, from ForTheMommas.", priceLabel: "$1.25 each when you buy 4", finalPrice: 1.25, unitLabel: "item", couponSteps: "Buy 4 participating Ragu, San Giorgio, or Mueller's items; the per-item price applies at checkout. No coupon needed.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Quantity threshold required; mix-and-match participation is per the source's deal list." },
  { externalKey: "2026-w42-giant-arm-hammer", retailer: "giant", title: "Arm & Hammer liquid detergent", detail: "Giant Food deal, Oct 9–15, from ForTheMommas.", priceLabel: "$1.99 · $3.99 − $2 digital coupon", finalPrice: 1.99, unitLabel: "bottle", couponSteps: "Use the $2 Giant digital coupon clipped to your GIANT Card on the $3.99 sale price.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "ForTheMommas", sourceUrl: "https://forthemommas.com/store-deals/giant-food-store/best-giant-deals-24", confidence: "indexed", caveat: "Digital coupon required; the same source shows a McCormick taco-seasoning gas-points scenario that can net free-plus — see the source for that math." },
  { externalKey: "2026-w42-giant-freschetta", retailer: "giant", title: "Freschetta pizza", detail: "Giant Food digital coupon, limit 2, expiring Oct 15.", priceLabel: "$3.99 with digital coupon", finalPrice: 3.99, unitLabel: "pizza", couponSteps: "Clip the Freschetta digital coupon to your GIANT Card; limit 2 per account.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Giant Food", sourceUrl: "https://giantfood.com/savings/coupons/browse", confidence: "indexed", caveat: "Digital coupon expires Oct 15, 2026 per the retailer's coupon gallery." },
  { externalKey: "2026-w42-ss-progresso", retailer: "stop_shop", title: "Progresso Pitmaster soups: 4 for $4", detail: "Coupon-plus-rebate stack from Living Rich with Coupons, week of Oct 9–15.", priceLabel: "$1 each when you buy 4 (after eCoupon + rebates)", finalPrice: 1, unitLabel: "can", couponSteps: "Buy 4 at $2.00 each ($8), clip the $1/4 Stop & Shop eCoupon (expires Nov 14), then submit (4) $0.50/1 Ibotta rebates and (2) $0.50/2 Fetch Rewards offers (Fetch expires Oct 31) — $4 back total.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "You pay $7 at the register after the eCoupon; the $1-per-can figure is after Ibotta and Fetch rebates, which vary by account." },
  { externalKey: "2026-w42-ss-avocado", retailer: "stop_shop", title: "Hass avocado", detail: "Stop & Shop weekly ad, Oct 9–15.", priceLabel: "$1.00 each", finalPrice: 1, unitLabel: "avocado", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-carrots", retailer: "stop_shop", title: "Baby-cut carrots, 1 lb (store brand)", detail: "Stop & Shop weekly ad, Oct 9–15; the same ad runs store-brand russet/mini potatoes and yellow onions buy 2, get 1 free.", priceLabel: "$1.00 per 1-lb bag", finalPrice: 1, unitLabel: "1-lb bag", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-grapes", retailer: "stop_shop", title: "Adora black seedless grapes", detail: "Stop & Shop weekly ad, Oct 9–15; Honeycrisp apples are $1.49/lb in the same ad.", priceLabel: "$1.99/lb", finalPrice: 1.99, unitLabel: "lb", couponSteps: "Weekly-ad price with your free GO Rewards card; no coupon stated.", validFrom: "2026-10-09", validThrough: "2026-10-15", sourceName: "Living Rich with Coupons", sourceUrl: "https://www.livingrichwithcoupons.com/2026/10/stop-shop-coupon-deals-week-of-10-9-10-15.html", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-ss-online", retailer: "stop_shop", title: "Online orders: $25 off your first two $100+ orders", detail: "Promo code SSONLINE50 for delivery or pickup orders, ending Oct 16, 2026 per the source.", priceLabel: "$25 off $100+ online orders (first two)", finalPrice: null, unitLabel: "offer", couponSteps: "Enter code SSONLINE50 on a $100+ delivery or pickup order; applies to your first two online orders.", validFrom: "2026-10-09", validThrough: "2026-10-16", sourceName: "DontPayFull", sourceUrl: "https://www.dontpayfull.com/at/stopandshop.com", confidence: "indexed", caveat: "The source verified the code working about a week before Oct 13; new online customers — confirm at checkout." },
  { externalKey: "2026-w42-fl-arm-hammer", retailer: "food_lion", title: "Arm & Hammer liquid or Power Paks", detail: "Food Lion weekly ad preview, Oct 14–20: liquid 32.5–43 oz or Power Paks 14 ct.", priceLabel: "$1.99", finalPrice: 1.99, unitLabel: "bottle or pack", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; stack MVP digital coupons where eligible." },
  { externalKey: "2026-w42-fl-haagen", retailer: "food_lion", title: "Häagen-Dazs, 14 oz", detail: "Food Lion weekly ad preview, Oct 14–20.", priceLabel: "$3.29", finalPrice: 3.29, unitLabel: "14 oz carton", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-eight-oclock", retailer: "food_lion", title: "Eight O'Clock coffee", detail: "Food Lion weekly ad preview, Oct 14–20: K-cups or bagged coffee.", priceLabel: "$5.99", finalPrice: 5.99, unitLabel: "package", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-eggo", retailer: "food_lion", title: "Eggo waffles", detail: "Food Lion weekly ad preview, Oct 14–20; Devour frozen dinners are $3.49 and Totino's Pizza Rolls (100 ct) $8.99 in the same ad.", priceLabel: "2 for $6 · $3 each", finalPrice: 3, unitLabel: "box", couponSteps: "Buy 2 eligible boxes with your MVP card; the 2-for-$6 price applies at checkout.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-dog-chow", retailer: "food_lion", title: "Purina Dog Chow, 16.5–20 lb", detail: "Food Lion weekly ad preview, Oct 14–20; Pup-Peroni and Milk-Bone treats are 2 for $6 in the same ad.", priceLabel: "$15.99", finalPrice: 15.99, unitLabel: "bag", couponSteps: "Weekly-ad MVP price; scan your free MVP card at checkout. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/food-lion-weekly-ad/", confidence: "indexed", caveat: "Weekly ad preview; confirm in your local ad." },
  { externalKey: "2026-w42-fl-fall-haul", retailer: "food_lion", title: "MVP Fall Haul: earn a $20 coupon", detail: "Shop 6 times with your personal MVP card during the event, spending $50+ per trip, and a $20 coupon prints at the bottom of your receipt.", priceLabel: "Earn a $20 coupon after 6 qualifying trips", finalPrice: null, unitLabel: "offer", couponSteps: "Use the same personal MVP card for 6 trips of $50+ during the event window; the earned $20 coupon prints on a receipt and is valid about two weeks.", validFrom: "2026-10-15", validThrough: "2026-11-26", sourceName: "Progressive Grocer", sourceUrl: "https://progressivegrocer.com/food-lion-offers-mvp-fall-haul", confidence: "indexed", caveat: "Sources differ on the window — Progressive Grocer says Oct 15–Nov 26, a coupon roundup says Oct 13–Nov 24; confirm the dates in your MVP account. A $5 off $30 printable coupon is also listed by coupon sources." },
  { externalKey: "2026-w42-costco-rice-krispies", retailer: "costco", title: "Kellogg's Rice Krispies Treats, 60 ct", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$8.99 · $12.99 − $4 Instant Savings", finalPrice: 8.99, unitLabel: "60-ct box", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "The current Instant Savings book ends Oct 18; the next book runs Oct 19–Nov 15 per The Krazy Coupon Lady. Warehouse selection varies." },
  { externalKey: "2026-w42-costco-tasters", retailer: "costco", title: "Nescafé Taster's Choice, 14 oz", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.99 · $21.99 − $6 Instant Savings", finalPrice: 15.99, unitLabel: "14 oz jar", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-vita-coco", retailer: "costco", title: "Vita Coco coconut water, 18-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.69 · $24.49 − $5.80 Instant Savings", finalPrice: 15.69, unitLabel: "18-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-celsius", retailer: "costco", title: "Celsius energy drinks, 18-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$17.99 · $23.99 − $6 Instant Savings", finalPrice: 17.99, unitLabel: "18-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-peets", retailer: "costco", title: "Peet's Organic French Roast, 32 oz", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members.", priceLabel: "$15.49 · $21.99 − $6.50 Instant Savings", finalPrice: 15.49, unitLabel: "32 oz bag", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-costco-classico", retailer: "costco", title: "Classico Organic pasta sauce, 3-pack", detail: "Costco Instant Savings book ending Oct 18; savings apply automatically for members. Maison Perrier (24 pk) $16.99 and Waterloo (24 pk) $7.99 after Instant Savings are in the same roundup.", priceLabel: "$8.79 · $12.79 − $4 Instant Savings", finalPrice: 8.79, unitLabel: "3-pack", couponSteps: "Instant Savings apply automatically at checkout for members; no clipping. Membership required.", validFrom: "2026-09-21", validThrough: "2026-10-18", sourceName: "Passionate Penny Pincher", sourceUrl: "https://passionatepennypincher.com/costco-deals-this-month/", confidence: "indexed", caveat: "Instant Savings book ends Oct 18; warehouse selection varies." },
  { externalKey: "2026-w42-sams-tyson", retailer: "sams_club", title: "Tyson chicken nuggets bag", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$9.97 member price", finalPrice: 9.97, unitLabel: "bag", couponSteps: "Club price for members; no coupon or clipping — Sam's Instant Savings are automatic account discounts when a book is running.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Sam's is between Instant Savings books (the next is predicted Oct 28–Nov 29 per KCL), so this week's finds are member/clearance prices that can change or sell out; membership required." },
  { externalKey: "2026-w42-sams-rice-krispies", retailer: "sams_club", title: "Kellogg's Rice Krispies cereal box", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$7.98 member price", finalPrice: 7.98, unitLabel: "box", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-barber", retailer: "sams_club", title: "Barber Foods Stuffed Turkey Breast, 6-pack", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$12.98 member price", finalPrice: 12.98, unitLabel: "6-pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-clorox", retailer: "sams_club", title: "Clorox Bathroom Cleaner, 3-pack", detail: "Member price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13.", priceLabel: "$12.98 member price", finalPrice: 12.98, unitLabel: "3-pack", couponSteps: "Club price for members; no coupon stated.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Between Instant Savings books; member prices can change at any time and the source listed no end date." },
  { externalKey: "2026-w42-sams-pants", retailer: "sams_club", title: "Member's Mark women's wide leg pants (clearance)", detail: "Clearance price spotted by The Krazy Coupon Lady's deal hunters about a week before Oct 13; a kids' Sandwash pullover at $5.81 and a women's UV tee at $4.81 were in the same roundup.", priceLabel: "$6.81 clearance · was $16.98", finalPrice: 6.81, unitLabel: "pair", couponSteps: "Clearance member price; no coupon stated. Check your club's clearance section or the item page in the app.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "Clearance is club-specific and sells out fast; the source listed no end date." },
  { externalKey: "2026-w42-sams-membership", retailer: "sams_club", title: "New-member deal: Club $20 or Plus $60", detail: "Promotional new-member pricing via the links in The Krazy Coupon Lady's Sam's Club roundup (Club regularly $60/year per the store profile).", priceLabel: "Club $20 (60% off) · Plus $60 for new members", finalPrice: null, unitLabel: "offer", couponSteps: "Join through the promotional link in the source roundup as a new member; pricing is applied by Sam's at signup.", validFrom: "2026-10-06", validThrough: null, sourceName: "The Krazy Coupon Lady", sourceUrl: "https://thekrazycouponlady.com/coupons-for/sams-club", confidence: "indexed", caveat: "New members only (per the source); promotional pricing can end at any time and the source listed no end date." },
  { externalKey: "2026-w42-pig-carrots", retailer: "piggly_wiggly", title: "Matchstix, Carrot Crinkle, or Supremes packs, 10–16 oz", detail: "Piggly Wiggly weekly ad preview, Oct 14–20.", priceLabel: "3 for $5 · about $1.67 each", finalPrice: 1.67, unitLabel: "pack", couponSteps: "Buy 3 eligible packs to get the per-pack price. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Piggly Wiggly stores are independently owned; ad prices vary by location. Select stores double coupons daily and seniors save an extra 5% on Wednesdays at participating locations." },
  { externalKey: "2026-w42-pig-oats", retailer: "piggly_wiggly", title: "Better Oats oatmeal, 10-pack", detail: "Piggly Wiggly weekly ad preview, Oct 14–20.", priceLabel: "2 for $6 · $3 each", finalPrice: 3, unitLabel: "10-pack box", couponSteps: "Buy 2 eligible boxes to get the per-box price. No coupon stated.", validFrom: "2026-10-14", validThrough: "2026-10-20", sourceName: "WeeklyAdHunters", sourceUrl: "https://weeklyadhunters.com/piggly-wiggly-weekly-ad-sales/", confidence: "indexed", caveat: "Independently owned stores; prices vary by location." },
  { externalKey: "2026-w42-pig-tide", retailer: "piggly_wiggly", title: "Tide 73–84 oz: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026.", priceLabel: "$3 off Tide (73–84 oz)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Tide digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Coupon detail comes from a Louisiana regional franchise site; Piggly Wiggly stores are independently operated and coupon programs vary — verify your local store participates." },
  { externalKey: "2026-w42-pig-crest", retailer: "piggly_wiggly", title: "Crest 3 oz+: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026.", priceLabel: "$3 off Crest (3 oz or larger)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Crest digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary — verify locally." },
  { externalKey: "2026-w42-pig-gain", retailer: "piggly_wiggly", title: "Gain laundry: $3 off digital coupon", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 25, 2026; covers Gain liquid 99 oz or powder 82 oz.", priceLabel: "$3 off Gain liquid 99 oz / powder 82 oz", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $3 Gain digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-25", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary — verify locally. The same gallery lists $2.50 off Poise/Depend through Nov 1 and $1 off 4 Campbell's cream soups through Oct 23." },
  { externalKey: "2026-w42-pig-hellmanns", retailer: "piggly_wiggly", title: "Hellmann's / Best Foods 11.5 oz: $2 off digital", detail: "Digital coupon from a Louisiana Piggly Wiggly franchise coupon gallery, expiring Oct 15, 2026.", priceLabel: "$2 off Hellmann's/Best Foods (11.5 oz)", finalPrice: null, unitLabel: "coupon", couponSteps: "Clip the $2 Hellmann's/Best Foods digital coupon in your local store's digital account before shopping.", validFrom: "2026-10-13", validThrough: "2026-10-15", sourceName: "Tangipig (Piggly Wiggly Louisiana)", sourceUrl: "https://tangipig.com/", confidence: "indexed", caveat: "Louisiana franchise source; independently operated stores vary — verify locally before the Oct 15 expiry." },
];

const storePriceFactors: Record<RetailerId, number> = {
  walmart: 1, heb: 0.99, aldi: 0.94, united: 1.08, dollar_general: 1.12, family_dollar: 1.13, kroger: 1.04, publix: 1.18, safeway: 1.17, target: 1.05, meijer: 1.02, giant: 1.11, stop_shop: 1.14, food_lion: 1.07, costco: 0.91, sams_club: 0.9, piggly_wiggly: 1.08,
};

function priceFor(basePrice: number, retailer: RetailerId) {
  return Math.round(basePrice * storePriceFactors[retailer] * 100) / 100;
}

type CatalogProduct = { id: string; category: string; brand: string; name: string; unit: string; imageSlug: string; imageAlt: string; basePrice: number | null; keywords: string; estimateUpdatedAt: string | null; upcs?: string[] };
type CatalogPrice = { retailer: RetailerId; storeName: string; amount: number; updatedAt: string; priceType: "sale" | "planning_estimate"; sourceLabel: string; validThrough: string | null };

const catalogBase: Array<Omit<CatalogProduct, "estimateUpdatedAt">> = [
  { id: "bananas", category: "Produce", brand: "Fresh", name: "Bananas", unit: "lb", imageSlug: "bananas", imageAlt: "Bananas product photo", basePrice: 0.58, keywords: "banana fruit" },
  { id: "apples", category: "Produce", brand: "Fresh", name: "Gala apples", unit: "lb", imageSlug: "apples", imageAlt: "Gala apples product photo", basePrice: 1.49, keywords: "apple fruit" },
  { id: "strawberries", category: "Produce", brand: "Fresh", name: "Strawberries", unit: "1-lb package", imageSlug: "strawberries", imageAlt: "Strawberries product photo", basePrice: 2.99, keywords: "berries fruit" },
  { id: "chicken-breast", category: "Meat & seafood", brand: "Fresh", name: "Boneless chicken breasts", unit: "lb", imageSlug: "chicken-breast", imageAlt: "Boneless chicken breasts product photo", basePrice: 3.24, keywords: "chicken poultry meat breast" },
  { id: "ground-beef", category: "Meat & seafood", brand: "Fresh", name: "Ground beef 80/20", unit: "lb", imageSlug: "ground-beef", imageAlt: "Ground beef 80/20 product photo", basePrice: 4.98, keywords: "beef hamburger meat" },
  { id: "bacon", category: "Meat & seafood", brand: "Smokehouse", name: "Sliced bacon", unit: "12 oz", imageSlug: "bacon", imageAlt: "Sliced bacon product photo", basePrice: 5.49, keywords: "pork breakfast meat" },
  { id: "salmon", category: "Meat & seafood", brand: "Fresh", name: "Atlantic salmon fillet", unit: "lb", imageSlug: "salmon", imageAlt: "Atlantic salmon fillet product photo", basePrice: 9.98, keywords: "fish seafood" },
  { id: "deli-turkey", category: "Meat & seafood", brand: "Deli", name: "Oven-roasted turkey", unit: "lb", imageSlug: "deli-turkey", imageAlt: "Oven-roasted turkey product photo", basePrice: 8.49, keywords: "deli lunch meat sandwich" },
  { id: "whole-milk", category: "Dairy & eggs", brand: "Store brand", name: "Whole milk", unit: "gallon", imageSlug: "whole-milk", imageAlt: "Whole milk product photo", basePrice: 3.48, keywords: "milk dairy" },
  { id: "eggs", category: "Dairy & eggs", brand: "Store brand", name: "Large eggs", unit: "dozen", imageSlug: "eggs", imageAlt: "Large eggs product photo", basePrice: 3.19, keywords: "eggs dairy" },
  { id: "cheddar", category: "Dairy & eggs", brand: "Store brand", name: "Sharp cheddar cheese", unit: "8 oz block", imageSlug: "cheddar", imageAlt: "Sharp cheddar cheese product photo", basePrice: 2.79, keywords: "cheese dairy" },
  { id: "yogurt", category: "Dairy & eggs", brand: "Tillamook", name: "Tillamook plain Greek yogurt", unit: "32 oz tub", imageSlug: "yogurt", imageAlt: "Tillamook plain Greek yogurt product photo", basePrice: 4.29, keywords: "yogurt dairy breakfast" },
  { id: "bread", category: "Bread & bakery", brand: "Bakery", name: "White sandwich bread", unit: "20 oz loaf", imageSlug: "bread", imageAlt: "White sandwich bread product photo", basePrice: 2.49, keywords: "bread toast" },
  { id: "bagels", category: "Bread & bakery", brand: "Bakery", name: "Plain bagels", unit: "6 count", imageSlug: "bagels", imageAlt: "Plain bagels product photo", basePrice: 3.49, keywords: "bagel bread breakfast" },
  { id: "rice", category: "Pantry staples", brand: "Food Lion", name: "Food Lion long grain white rice", unit: "2-lb bag", imageSlug: "rice", imageAlt: "Food Lion long grain white rice product photo", basePrice: 2.18, keywords: "rice grain pantry" },
  { id: "pasta", category: "Pantry staples", brand: "Store brand", name: "Spaghetti pasta", unit: "16 oz box", imageSlug: "pasta", imageAlt: "Spaghetti pasta product photo", basePrice: 1.38, keywords: "pasta noodles pantry" },
  { id: "peanut-butter", category: "Pantry staples", brand: "Store brand", name: "Creamy peanut butter", unit: "16 oz jar", imageSlug: "peanut-butter", imageAlt: "Creamy peanut butter product photo", basePrice: 2.48, keywords: "peanut spread pantry" },
  { id: "canned-tomatoes", category: "Canned goods", brand: "Del Monte", name: "Del Monte diced tomatoes with green chilies", unit: "14.5 oz can", imageSlug: "canned-tomatoes", imageAlt: "Del Monte diced tomatoes with green chilies product photo", basePrice: 1.18, keywords: "tomato canned vegetables" },
  { id: "canned-tuna", category: "Canned goods", brand: "StarKist", name: "StarKist chunk light tuna in water", unit: "5 oz can", imageSlug: "canned-tuna", imageAlt: "StarKist chunk light tuna in water product photo", basePrice: 1.19, keywords: "tuna fish canned seafood" },
  { id: "cheerios", category: "Cereal", brand: "General Mills", name: "Original Cheerios", unit: "12.6 oz box", imageSlug: "cheerios", imageAlt: "Original Cheerios product photo", basePrice: 4.48, keywords: "cereal breakfast oats", upcs: ["0001600027526", "016000275263"] },
  { id: "honey-nut", category: "Cereal", brand: "General Mills", name: "Honey Nut Cheerios", unit: "27.2 oz box", imageSlug: "honey-nut", imageAlt: "Honey Nut Cheerios giant size product photo", basePrice: 4.48, keywords: "cereal breakfast honey oats" },
  { id: "frosted-flakes", category: "Cereal", brand: "Kellogg's", name: "Frosted Flakes", unit: "12 oz box", imageSlug: "frosted-flakes", imageAlt: "Frosted Flakes product photo", basePrice: 4.69, keywords: "cereal breakfast corn" },
  { id: "froot-loops", category: "Cereal", brand: "Kellogg's", name: "Froot Loops", unit: "16.6 oz box", imageSlug: "froot-loops", imageAlt: "Froot Loops product photo", basePrice: 4.69, keywords: "cereal breakfast fruit" },
  { id: "ground-coffee", category: "Coffee & tea", brand: "Folgers", name: "Folgers Classic Roast ground coffee", unit: "40.3 oz canister", imageSlug: "ground-coffee", imageAlt: "Folgers Classic Roast ground coffee product photo", basePrice: 9.98, keywords: "coffee caffeine breakfast" },
  { id: "coffee-pods", category: "Coffee & tea", brand: "Snack Box Pros", name: "Coffee pod variety tray", unit: "24 count", imageSlug: "coffee-pods", imageAlt: "Coffee pod variety tray product photo", basePrice: 10.98, keywords: "coffee pods k cups" },
  { id: "black-tea", category: "Coffee & tea", brand: "Twinings", name: "Twinings Blackcurrant Breeze tea bags", unit: "20 count", imageSlug: "black-tea", imageAlt: "Twinings Blackcurrant Breeze tea bags product photo", basePrice: 4.48, keywords: "tea bags drinks" },
  { id: "frozen-pizza", category: "Frozen foods", brand: "Store brand", name: "Frozen cheese pizza", unit: "each", imageSlug: "frozen-pizza", imageAlt: "Frozen cheese pizza product photo", basePrice: 5.48, keywords: "pizza frozen dinner" },
  { id: "frozen-vegetables", category: "Frozen foods", brand: "Store brand", name: "Mixed vegetables", unit: "12 oz bag", imageSlug: "frozen-vegetables", imageAlt: "Mixed vegetables product photo", basePrice: 1.49, keywords: "vegetables peas carrots" },
  { id: "ice-cream", category: "Frozen foods", brand: "Store brand", name: "Vanilla ice cream", unit: "48 oz tub", imageSlug: "ice-cream", imageAlt: "Vanilla ice cream product photo", basePrice: 3.98, keywords: "ice cream dessert" },
  { id: "orange-juice", category: "Beverages", brand: "Store brand", name: "Orange juice", unit: "52 fl oz", imageSlug: "orange-juice", imageAlt: "Orange juice product photo", basePrice: 3.78, keywords: "juice drink breakfast" },
  { id: "sparkling-water", category: "Beverages", brand: "LaCroix", name: "LaCroix peach-pear sparkling water", unit: "12-pack", imageSlug: "sparkling-water", imageAlt: "LaCroix peach-pear sparkling water product photo", basePrice: 4.98, keywords: "water seltzer cans" },
  { id: "potato-chips", category: "Snacks", brand: "Store brand", name: "Classic potato chips", unit: "8 oz bag", imageSlug: "potato-chips", imageAlt: "Classic potato chips product photo", basePrice: 2.98, keywords: "chips salty snack" },
  { id: "granola-bars", category: "Snacks", brand: "Nature Valley", name: "Nature Valley Crunchy granola bars", unit: "6 count", imageSlug: "granola-bars", imageAlt: "Nature Valley Crunchy granola bars product photo", basePrice: 3.48, keywords: "granola snack bars" },
  { id: "diapers", category: "Baby", brand: "Up & Up", name: "Up & Up overnight diapers, size 3", unit: "88 count box", imageSlug: "diapers", imageAlt: "Up & Up overnight diapers, size 3 product photo", basePrice: 16.49, keywords: "baby diapers infant" },
  { id: "baby-formula", category: "Baby", brand: "Store brand", name: "Infant formula powder", unit: "22 oz can", imageSlug: "baby-formula", imageAlt: "Infant formula powder product photo", basePrice: 24.98, keywords: "baby formula milk" },
  { id: "paper-towels", category: "Household", brand: "Bounty", name: "Bounty paper towels", unit: "6-roll pack", imageSlug: "paper-towels", imageAlt: "Bounty paper towels product photo", basePrice: 8.98, keywords: "paper towels kitchen" },
  { id: "toilet-paper", category: "Household", brand: "Quilton", name: "Quilton toilet paper", unit: "12-roll pack", imageSlug: "toilet-paper", imageAlt: "Quilton toilet paper product photo", basePrice: 9.98, keywords: "bath tissue paper" },
  { id: "laundry-detergent", category: "Cleaning", brand: "Store brand", name: "Liquid laundry detergent", unit: "92 fl oz", imageSlug: "laundry-detergent", imageAlt: "Liquid laundry detergent product photo", basePrice: 9.98, keywords: "soap laundry washer" },
  { id: "dish-soap", category: "Cleaning", brand: "Store brand", name: "Dish soap", unit: "28 fl oz", imageSlug: "dish-soap", imageAlt: "Dish soap product photo", basePrice: 3.48, keywords: "dishwashing cleaning kitchen" },
  { id: "toothpaste", category: "Personal care", brand: "Marvis", name: "Marvis Aquatic Mint toothpaste", unit: "tube", imageSlug: "toothpaste", imageAlt: "Marvis Aquatic Mint toothpaste product photo", basePrice: 3.98, keywords: "dental oral care" },
  { id: "shampoo", category: "Personal care", brand: "Store brand", name: "Daily shampoo", unit: "22 fl oz", imageSlug: "shampoo", imageAlt: "Daily shampoo product photo", basePrice: 5.98, keywords: "hair care bath" },
  { id: "dog-food", category: "Pet supplies", brand: "Purina Dog Chow", name: "Purina Dog Chow Complete Adult", unit: "50-lb bag", imageSlug: "dog-food", imageAlt: "Purina Dog Chow Complete Adult product photo", basePrice: 18.98, keywords: "pet dog kibble" },
  { id: "cat-litter", category: "Pet supplies", brand: "Store brand", name: "Lightweight cat litter", unit: "7-lb jug", imageSlug: "cat-litter", imageAlt: "Lightweight cat litter product photo", basePrice: 11.98, keywords: "pet cat litter" },
];

const catalog: CatalogProduct[] = [
  ...catalogBase.map((product) => ({ ...product, estimateUpdatedAt: "2026-10-13T00:00:00.000Z" })),
  ...extraCatalog,
];

const saleCatalogMatches: Record<string, string[]> = {
  "2026-10-wm-klondike": ["ice-cream-klondike-ice-cream-bars-6-count"],
  "2026-10-wm-coffee": ["coffee-pods-maud-s-fall-coffee-pods-24-count"],
  "2026-10-heb-apples": ["apple-rave-apples-lb"],
  "2026-10-aldi-honeycrisp": ["apple-honeycrisp-apples-lb"],
  "2026-10-aldi-chicken": ["chicken-breast-fresh-chicken-breasts-lb", "chicken-breast"],
  "2026-10-heb-barilla": ["pasta"],
  "2026-10-kroger-cereal": ["cheerios", "honey-nut", "frosted-flakes", "froot-loops"],
  "2026-10-kroger-pasta": ["pasta-penne-pasta-16-oz-box", "pasta-rotini-pasta-16-oz-box"],
  "2026-10-kroger-milk": ["whole-milk"],
  "2026-10-meijer-chicken": ["chicken-breast", "chicken-breast-family-pack-chicken-breasts-5-lb-pack"],
  "2026-10-meijer-folgers": ["ground-coffee"],
  "2026-10-meijer-tidycats": ["cat-litter-unscented-clumping-cat-litter-20-lb-jug", "cat-litter-multi-cat-clumping-litter-20-lb-jug"],
  "2026-10-giant-eggs": ["eggs"],
  "2026-10-ss-chicken": ["chicken-breast", "chicken-breast-fresh-chicken-breasts-lb"],
  "2026-10-ss-barilla": ["pasta-penne-pasta-16-oz-box", "pasta-rotini-pasta-16-oz-box"],
  "2026-10-fl-klondike": ["ice-cream-klondike-ice-cream-bars-6-count"],
  "2026-10-costco-tide": ["laundry-high-efficiency-laundry-detergent-92-fl-oz"],
  "2026-w42-aldi-tenderloins": ["chicken-breast-chicken-breast-tenderloins-lb"],
  "2026-w42-aldi-granny-smith": ["apple-granny-smith-apples-lb"],
  "2026-w42-united-dawn": ["dish-soap-dish-soap-refill-56-fl-oz"],
  "2026-w42-safeway-honeycrisp": ["apple-honeycrisp-apples-lb"],
  "2026-w42-safeway-chicken": ["chicken-breast", "chicken-breast-fresh-chicken-breasts-lb"],
  "2026-w42-safeway-folgers": ["ground-coffee"],
  "2026-w42-target-dawn": ["dish-soap-free-and-clear-dish-soap-24-fl-oz", "dish-soap-antibacterial-dish-soap-24-fl-oz"],
  "2026-w42-publix-digiorno": ["pizza-frozen-meat-lovers-pizza-each"],
  "2026-w42-costco-peets": ["coffee-peet-s-french-roast-ground-coffee-32-oz-bag"],
  "2026-w42-meijer-egglands": ["eggs"],
  "2026-w42-giant-cheese": ["cheddar-shredded-cheddar-cheese-8-oz-bag"],
};

type PlanInfo = { tier: "free" | "saver"; status: string; currentPeriodEnd: string | null; billingConfigured: boolean };

async function loadPlan(ctx: Ctx): Promise<PlanInfo> {
  const db = ctx.db<typeof schema>();
  const billingRows = await db.select().from(schema.billingSettings).limit(1);
  const billing = billingRows[0];
  const billingConfigured = Boolean(billing?.paymentLinkUrl && billing?.stripeSecretKey);
  const subRows = await db.select().from(schema.subscriptions).limit(1);
  const sub = subRows[0];
  const periodActive = !sub?.currentPeriodEnd || sub.currentPeriodEnd.getTime() >= Date.now();
  const saver = Boolean(sub && (sub.status === "active" || sub.status === "trialing") && periodActive);
  return {
    tier: saver ? "saver" : "free",
    status: sub?.status ?? "none",
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
    billingConfigured,
  };
}

const alertStopWords = new Set(["and", "the", "with", "for", "from", "each", "item", "pack", "size", "fresh", "whole"]);

function dealMatchesBasketWords(deal: { title: string; detail: string }, itemNames: string[]) {
  const dealWords = new Set(`${deal.title} ${deal.detail}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !alertStopWords.has(word)));
  return itemNames.some((name) => name.toLowerCase().split(/[^a-z0-9]+/).some((word) => word.length > 2 && dealWords.has(word)));
}

function isDealCurrent(deal: { validThrough: string | null }) {
  if (!deal.validThrough) return true;
  return deal.validThrough >= new Date().toISOString().slice(0, 10);
}

function normalizedProductText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function dealAppliesToProduct(deal: { externalKey: string; title: string }, product: CatalogProduct) {
  if (saleCatalogMatches[deal.externalKey]?.includes(product.id)) return true;
  const dealTitle = normalizedProductText(deal.title);
  const productName = normalizedProductText(product.name);
  return productName.length >= 8 && (dealTitle === productName || dealTitle.startsWith(`${productName} `));
}

async function insertPricedBasketItem(
  ctx: Ctx,
  item: { name: string; unit: string; prices: (retailer: RetailerId) => number; sourceLabel: string },
) {
  const db = ctx.db<typeof schema>();
  const rows = await db.insert(schema.basketItems).values({ name: item.name, quantity: 1, unit: item.unit }).returning({ id: schema.basketItems.id });
  const basketItem = rows[0];
  if (!basketItem) throw new Error("Scanned item could not be added");
  for (const retailer of retailerValues) {
    await db.insert(schema.quotes).values({ basketItemId: basketItem.id, retailer, unitPrice: item.prices(retailer), savings: 0, sourceLabel: item.sourceLabel });
  }
  ctx.invalidateQueries();
  return basketItem.id;
}

const scanResponse = z.object({
  status: z.enum(["added_catalog", "added_saved", "unknown"]),
  upc: z.string(),
  name: z.string().nullable(),
  id: z.number().nullable(),
});

const knownDealSavings: Record<string, number> = {
  "2026-10-wm-klondike": 2.5,
  "2026-10-wm-pb2": 14,
  "2026-10-wm-coffee": 6.88,
  "2026-10-united-hidden-valley": 1.69,
  "2026-10-united-butterfinger": 1.5,
  "2026-w42-wm-tylenol": 4.7,
  "2026-w42-wm-pur-gum": 3.99,
  "2026-w42-wm-sheba": 2.68,
  "2026-w42-wm-pillsbury-dough": 3.49,
  "2026-w42-wm-king-arthur": 3,
  "2026-w42-wm-ground-beef": 5,
  "2026-w42-kroger-yakisoba": 1.19,
  "2026-w42-kroger-grands": 1.9,
  "2026-w42-kroger-tillamook": 2.29,
  "2026-w42-publix-digiorno": 7.14,
  "2026-w42-target-oxiclean": 2.07,
  "2026-w42-target-poise": 2.7,
  "2026-w42-target-degree": 2.15,
  "2026-w42-target-dove": 2.14,
  "2026-w42-target-dawn": 2.1,
  "2026-w42-target-febreze": 2.08,
  "2026-w42-target-swiffer": 5.25,
  "2026-w42-dg-irish-spring": 2,
  "2026-w42-dg-febreze-plug": 5,
  "2026-w42-dg-febreze-small": 2,
  "2026-w42-dg-energizer": 3,
  "2026-w42-costco-rice-krispies": 4,
  "2026-w42-costco-tasters": 6,
  "2026-w42-costco-vita-coco": 8.8,
  "2026-w42-costco-celsius": 6,
  "2026-w42-costco-peets": 6.5,
  "2026-w42-costco-classico": 4,
  "2026-w42-sams-pants": 10.17,
  "2026-w42-giant-arm-hammer": 2,
  "2026-w42-giant-ben-jerrys": 1,
  "2026-w42-giant-birdseye": 0.25,
};

const dealShape = z.object({
  retailer: z.enum(retailerValues),
  title: z.string().min(3).max(160),
  detail: z.string().min(3).max(400),
  priceLabel: z.string().min(1).max(120),
  finalPrice: z.number().nonnegative().nullable(),
  unitLabel: z.string().min(1).max(60),
  couponSteps: z.string().min(1).max(400),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  validThrough: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  sourceName: z.string().min(1).max(120),
  sourceUrl: z.string().url(),
  caveat: z.string().max(400).nullable(),
});

type StripeSubscription = {
  id: string;
  status: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  customer: string;
};

async function stripeRequest(secretKey: string, path: string, params?: Record<string, string>): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const isGet = params === undefined;
  const url = isGet ? `https://api.stripe.com/v1/${path}` : `https://api.stripe.com/v1/${path}`;
  const response = await fetch(url, {
    method: isGet ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(isGet ? {} : { "Content-Type": "application/x-www-form-urlencoded" }),
    },
    ...(isGet ? {} : { body: new URLSearchParams(params).toString() }),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, body };
}

async function stripeGet(secretKey: string, path: string, query: Record<string, string>): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const qs = new URLSearchParams(query).toString();
  const response = await fetch(`https://api.stripe.com/v1/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, body };
}

function stripeErrorMessage(body: Record<string, unknown>): string {
  const error = body.error as { message?: string } | undefined;
  return error?.message ?? "Stripe did not accept that request.";
}

async function saveSubscriptionRow(ctx: Ctx, values: { email: string | null; status: "none" | "active" | "trialing" | "past_due" | "canceled" | "incomplete"; stripeCustomerId: string | null; stripeSubscriptionId: string | null; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean }) {
  const db = ctx.db<typeof schema>();
  await db.insert(schema.subscriptions).values({ id: 1, ...values }).onConflictDoUpdate({
    target: schema.subscriptions.id,
    set: { ...values, updatedAt: new Date() },
  });
}

const billingResponse = z.object({
  configured: z.boolean(),
  publishableKey: z.string().nullable(),
  paymentLinkUrl: z.string().nullable(),
  secretKeySet: z.boolean(),
  subscription: z.object({
    status: z.string(),
    email: z.string().nullable(),
    currentPeriodEnd: z.string().nullable(),
    cancelAtPeriodEnd: z.boolean(),
  }).nullable(),
});

export const Actions = {
  getDashboard: defineAction({
    request: z.object({}),
    response: z.object({
      region: z.enum(regionValues),
      regions: z.array(z.object({ id: z.enum(regionValues), label: z.string() })),
      stores: z.array(z.object({ id: z.enum(retailerValues), name: z.string(), short: z.string(), regions: z.array(z.enum(regionValues)), orderUrl: z.string(), couponUrl: z.string().nullable(), delivery: z.string(), rule: z.string(), membership: z.string(), policyStatus: z.enum(["verified", "confirm_local"]) })),
      catalog: z.array(z.object({ id: z.string(), category: z.string(), brand: z.string(), name: z.string(), unit: z.string(), imageSlug: z.string(), imageAlt: z.string(), keywords: z.string(), prices: z.array(z.object({ retailer: z.enum(retailerValues), storeName: z.string(), amount: z.number(), updatedAt: z.string(), priceType: z.enum(["sale", "planning_estimate"]), sourceLabel: z.string(), validThrough: z.string().nullable() })) })),
      deals: z.array(z.object({ id: z.number(), retailer: z.enum(retailerValues), title: z.string(), detail: z.string(), priceLabel: z.string(), finalPrice: z.number().nullable(), unitLabel: z.string(), couponSteps: z.string(), validFrom: z.string().nullable(), validThrough: z.string().nullable(), sourceName: z.string(), sourceUrl: z.string(), confidence: z.enum(["verified_live", "indexed"]), caveat: z.string().nullable(), refreshedAt: z.string() })),
      items: z.array(z.object({ id: z.number(), name: z.string(), quantity: z.number(), unit: z.string(), checked: z.boolean(), sourceDealId: z.number().nullable(), quotes: z.array(z.object({ retailer: z.enum(retailerValues), unitPrice: z.number(), savings: z.number(), sourceLabel: z.string(), updatedAt: z.string() })) })),
      comparisons: z.array(z.object({ retailer: z.enum(retailerValues), storeName: z.string(), subtotal: z.number(), savings: z.number(), delivery: z.number(), deliveryUpdatedAt: z.string().nullable(), total: z.number(), missingCount: z.number(), complete: z.boolean(), priceUpdatedFrom: z.string().nullable(), priceUpdatedThrough: z.string().nullable() })),
      splitComparison: z.object({ stores: z.tuple([z.enum(retailerValues), z.enum(retailerValues)]), storeNames: z.tuple([z.string(), z.string()]), total: z.number(), savings: z.number(), priceUpdatedFrom: z.string(), priceUpdatedThrough: z.string(), lines: z.array(z.object({ item: z.string(), retailer: z.enum(retailerValues), storeName: z.string(), total: z.number(), updatedAt: z.string() })) }).nullable(),
      lastRefresh: z.string().nullable(),
      plan: z.object({ tier: z.enum(["free", "saver"]), status: z.string(), currentPeriodEnd: z.string().nullable(), billingConfigured: z.boolean() }),
      alerts: z.array(z.object({ dealId: z.number(), retailer: z.enum(retailerValues), title: z.string(), priceLabel: z.string(), validThrough: z.string().nullable(), refreshedAt: z.string(), isNew: z.boolean() })),
      feedChecks: z.array(z.object({ retailer: z.enum(retailerValues), checkedAt: z.string(), currentDeals: z.number(), note: z.string().nullable() })),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const dealRows = await db.select().from(schema.deals).orderBy(desc(schema.deals.refreshedAt), asc(schema.deals.retailer));
      const itemRows = await db.select().from(schema.basketItems).orderBy(asc(schema.basketItems.createdAt));
      const quoteRows = await db.select().from(schema.quotes);
      const feeRows = await db.select().from(schema.deliveryFees);
      const settingRows = await db.select().from(schema.userSettings).limit(1);
      const region: RegionId = settingRows[0]?.region ?? "texas";
      const plan = await loadPlan(ctx);
      const eligibleStores = stores.filter((store) => region === "national" ? store.regions.includes("national") : store.regions.includes(region) || store.regions.includes("national"));
      const items = itemRows.map((item) => ({
        id: item.id, name: item.name, quantity: item.quantity, unit: item.unit, checked: item.checked, sourceDealId: item.sourceDealId,
        quotes: quoteRows.filter((quote) => quote.basketItemId === item.id).map((quote) => ({ retailer: quote.retailer, unitPrice: quote.unitPrice, savings: quote.savings, sourceLabel: quote.sourceLabel, updatedAt: quote.updatedAt.toISOString() })),
      }));
      const activeItems = items.filter((item) => !item.checked);
      const comparisons = eligibleStores.map((store) => {
        let subtotal = 0; let savings = 0; let missingCount = 0;
        const usedDates: string[] = [];
        for (const item of activeItems) {
          const quote = item.quotes.find((candidate) => candidate.retailer === store.id);
          if (!quote) { missingCount += 1; continue; }
          subtotal += quote.unitPrice * item.quantity;
          savings += quote.savings * item.quantity;
          usedDates.push(quote.updatedAt);
        }
        const deliveryRow = feeRows.find((fee) => fee.retailer === store.id);
        const delivery = deliveryRow?.amount ?? 0;
        if (deliveryRow) usedDates.push(deliveryRow.updatedAt.toISOString());
        usedDates.sort();
        return { retailer: store.id, storeName: store.name, subtotal, savings, delivery, deliveryUpdatedAt: deliveryRow?.updatedAt.toISOString() ?? null, total: subtotal - savings + delivery, missingCount, complete: activeItems.length > 0 && missingCount === 0, priceUpdatedFrom: usedDates[0] ?? null, priceUpdatedThrough: usedDates.at(-1) ?? null };
      }).sort((a, b) => Number(b.complete) - Number(a.complete) || a.total - b.total);
      let splitComparison: { stores: [RetailerId, RetailerId]; storeNames: [string, string]; total: number; savings: number; priceUpdatedFrom: string; priceUpdatedThrough: string; lines: Array<{ item: string; retailer: RetailerId; storeName: string; total: number; updatedAt: string }> } | null = null;
      for (let i = 0; i < eligibleStores.length; i += 1) {
        const first = eligibleStores[i];
        if (!first) continue;
        for (let j = i + 1; j < eligibleStores.length; j += 1) {
          const second = eligibleStores[j];
          if (!second) continue;
          let itemTotal = 0; let savings = 0; let complete = activeItems.length > 0;
          const used = new Set<RetailerId>();
          const lines: Array<{ item: string; retailer: RetailerId; storeName: string; total: number; updatedAt: string }> = [];
          for (const item of activeItems) {
            const qa = item.quotes.find((quote) => quote.retailer === first.id);
            const qb = item.quotes.find((quote) => quote.retailer === second.id);
            if (!qa && !qb) { complete = false; break; }
            const chosenStore = !qb || (qa && qa.unitPrice - qa.savings <= qb.unitPrice - qb.savings) ? first : second;
            const chosenQuote = chosenStore.id === first.id ? qa : qb;
            if (!chosenQuote) { complete = false; break; }
            const lineTotal = (chosenQuote.unitPrice - chosenQuote.savings) * item.quantity;
            itemTotal += lineTotal; savings += chosenQuote.savings * item.quantity; used.add(chosenStore.id);
            lines.push({ item: item.name, retailer: chosenStore.id, storeName: chosenStore.name, total: lineTotal, updatedAt: chosenQuote.updatedAt });
          }
          if (!complete || used.size < 2) continue;
          const deliveryRows = [...used].map((id) => feeRows.find((fee) => fee.retailer === id)).filter((row): row is (typeof feeRows)[number] => Boolean(row));
          const delivery = deliveryRows.reduce((sum, row) => sum + row.amount, 0);
          const total = itemTotal + delivery;
          const priceDates = [...lines.map((line) => line.updatedAt), ...deliveryRows.map((row) => row.updatedAt.toISOString())].sort();
          const priceUpdatedFrom = priceDates[0];
          const priceUpdatedThrough = priceDates.at(-1);
          if (!priceUpdatedFrom || !priceUpdatedThrough) continue;
          if (!splitComparison || total < splitComparison.total) splitComparison = { stores: [first.id, second.id], storeNames: [first.name, second.name], total, savings, priceUpdatedFrom, priceUpdatedThrough, lines };
        }
      }
      const lastRefresh = dealRows.length > 0 ? new Date(Math.max(...dealRows.map((deal) => deal.refreshedAt.getTime()))).toISOString() : null;
      const checkRows = await db.select().from(schema.dealFeedChecks).orderBy(desc(schema.dealFeedChecks.checkedAt));
      const feedChecks = eligibleStores.flatMap((store) => {
        const latest = checkRows.find((row) => row.retailer === store.id);
        return latest ? [{ retailer: store.id, checkedAt: latest.checkedAt.toISOString(), currentDeals: latest.currentDeals, note: latest.note }] : [];
      });
      let alerts: Array<{ dealId: number; retailer: RetailerId; title: string; priceLabel: string; validThrough: string | null; refreshedAt: string; isNew: boolean }> = [];
      if (plan.tier === "saver") {
        const seenRows = await db.select().from(schema.alertSeen);
        const seenIds = new Set(seenRows.map((row) => row.dealId));
        const basketNames = activeItems.map((item) => item.name);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        alerts = dealRows
          .filter((deal) => eligibleStores.some((store) => store.id === deal.retailer))
          .filter((deal) => isDealCurrent(deal))
          .filter((deal) => dealMatchesBasketWords(deal, basketNames) || catalog.some((product) => basketNames.includes(product.name) && dealAppliesToProduct(deal, product)))
          .slice(0, 12)
          .map((deal) => ({ dealId: deal.id, retailer: deal.retailer, title: deal.title, priceLabel: deal.priceLabel, validThrough: deal.validThrough, refreshedAt: deal.refreshedAt.toISOString(), isNew: deal.refreshedAt.getTime() >= sevenDaysAgo && !seenIds.has(deal.id) }));
      }
      return {
        region,
        regions,
        stores: eligibleStores,
        catalog: catalog.map((product) => ({
          id: product.id,
          category: product.category,
          brand: product.brand,
          name: product.name,
          unit: product.unit,
          imageSlug: product.imageSlug,
          imageAlt: product.imageAlt,
          keywords: product.keywords,
          prices: eligibleStores.reduce<CatalogPrice[]>((prices, store) => {
            const sale = plan.tier === "saver" ? dealRows.find((deal) => deal.retailer === store.id && deal.finalPrice !== null && isDealCurrent(deal) && dealAppliesToProduct(deal, product)) : undefined;
            if (sale?.finalPrice !== null && sale?.finalPrice !== undefined) prices.push({ retailer: store.id, storeName: store.name, amount: sale.finalPrice, updatedAt: sale.refreshedAt.toISOString(), priceType: "sale", sourceLabel: sale.sourceName, validThrough: sale.validThrough });
            else if (product.basePrice !== null && product.estimateUpdatedAt) prices.push({ retailer: store.id, storeName: store.name, amount: priceFor(product.basePrice, store.id), updatedAt: product.estimateUpdatedAt, priceType: "planning_estimate", sourceLabel: "Planning estimate", validThrough: null });
            return prices;
          }, []),
        })), 
        deals: dealRows.filter((deal) => eligibleStores.some((store) => store.id === deal.retailer)).map((deal) => ({ ...deal, refreshedAt: deal.refreshedAt.toISOString() })),
        items,
        comparisons: plan.tier === "saver" ? comparisons : [],
        splitComparison: plan.tier === "saver" ? splitComparison : null,
        lastRefresh,
        plan,
        alerts,
        feedChecks,
      };
    },
  }),

  setRegion: defineAction({
    request: z.object({ region: z.enum(regionValues) }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const db = ctx.db<typeof schema>();
      await db.insert(schema.userSettings).values({ id: 1, region: args.region }).onConflictDoUpdate({ target: schema.userSettings.id, set: { region: args.region, updatedAt: new Date() } });
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  addCatalogItem: defineAction({
    request: z.object({ catalogId: z.string().min(1), quantity: z.number().int().min(1).max(99).default(1) }),
    response: z.object({ id: z.number() }),
    async handler(ctx, args) {
      const product = catalog.find((candidate) => candidate.id === args.catalogId);
      if (!product) throw new Error("Catalog item unavailable");
      const db = ctx.db<typeof schema>();
      const rows = await db.insert(schema.basketItems).values({ name: product.name, quantity: args.quantity, unit: product.unit }).returning({ id: schema.basketItems.id });
      const item = rows[0];
      if (!item) throw new Error("Catalog item could not be added");
      const plan = await loadPlan(ctx);
      const dealRows = await db.select().from(schema.deals);
      for (const retailer of retailerValues) {
        const sale = plan.tier === "saver" ? dealRows.find((deal) => deal.retailer === retailer && deal.finalPrice !== null && isDealCurrent(deal) && dealAppliesToProduct(deal, product)) : undefined;
        if (sale?.finalPrice !== null && sale?.finalPrice !== undefined) {
          await db.insert(schema.quotes).values({ basketItemId: item.id, retailer, unitPrice: sale.finalPrice, savings: 0, sourceLabel: `${sale.sourceName} sale · updated ${sale.refreshedAt.toISOString().slice(0, 10)}`, updatedAt: sale.refreshedAt });
        } else if (product.basePrice !== null && product.estimateUpdatedAt) {
          await db.insert(schema.quotes).values({ basketItemId: item.id, retailer, unitPrice: priceFor(product.basePrice, retailer), savings: 0, sourceLabel: `Planning estimate · updated ${product.estimateUpdatedAt.slice(0, 10)}`, updatedAt: new Date(product.estimateUpdatedAt) });
        }
      }
      ctx.invalidateQueries();
      return { id: item.id };
    },
  }),

  addScannedItem: defineAction({
    request: z.object({ upc: z.string().regex(/^\d{8,14}$/) }),
    response: scanResponse,
    async handler(ctx, args): Promise<z.infer<typeof scanResponse>> {
      const product = catalog.find((candidate) => candidate.upcs?.includes(args.upc));
      if (product?.basePrice !== null && product?.basePrice !== undefined) {
        const id = await insertPricedBasketItem(ctx, {
          name: product.name,
          unit: product.unit,
          prices: (retailer) => priceFor(product.basePrice ?? 0, retailer),
          sourceLabel: `Catalog barcode planning estimate · updated ${(product.estimateUpdatedAt ?? new Date().toISOString()).slice(0, 10)}`,
        });
        return { status: "added_catalog", upc: args.upc, name: product.name, id };
      }
      const db = ctx.db<typeof schema>();
      const rememberedRows = await db.select().from(schema.scannedProducts).where(eq(schema.scannedProducts.upc, args.upc)).limit(1);
      const remembered = rememberedRows[0];
      if (!remembered) return { status: "unknown", upc: args.upc, name: null, id: null };
      const id = await insertPricedBasketItem(ctx, {
        name: remembered.name,
        unit: remembered.unit,
        prices: () => remembered.basePrice,
        sourceLabel: "Saved barcode estimate",
      });
      return { status: "added_saved", upc: args.upc, name: remembered.name, id };
    },
  }),

  rememberScannedProduct: defineAction({
    request: z.object({
      upc: z.string().regex(/^\d{8,14}$/),
      name: z.string().trim().min(2).max(100),
      unit: z.string().trim().min(1).max(30).default("item"),
      price: z.number().nonnegative().max(10000),
    }),
    response: z.object({ id: z.number(), name: z.string() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      await db.insert(schema.scannedProducts).values({ upc: args.upc, name: args.name, unit: args.unit, basePrice: args.price }).onConflictDoUpdate({
        target: schema.scannedProducts.upc,
        set: { name: args.name, unit: args.unit, basePrice: args.price, updatedAt: new Date() },
      });
      const id = await insertPricedBasketItem(ctx, {
        name: args.name,
        unit: args.unit,
        prices: () => args.price,
        sourceLabel: "Scanned shopper estimate",
      });
      return { id, name: args.name };
    },
  }),

  addBasketItem: defineAction({
    request: z.object({ name: z.string().trim().min(2).max(100), quantity: z.number().int().min(1).max(99), unit: z.string().trim().min(1).max(30) }),
    response: z.object({ id: z.number() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const rows = await db.insert(schema.basketItems).values({ name: args.name, quantity: args.quantity, unit: args.unit }).returning({ id: schema.basketItems.id });
      const row = rows[0];
      if (!row) throw new Error("Basket item could not be created");
      ctx.invalidateQueries();
      return { id: row.id };
    },
  }),

  addDealToBasket: defineAction({
    request: z.object({ dealId: z.number().int().positive() }),
    response: z.object({ id: z.number() }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const found = await db.select().from(schema.deals).where(eq(schema.deals.id, args.dealId)).limit(1);
      const deal = found[0];
      if (!deal) throw new Error("That deal is no longer available");
      const rows = await db.insert(schema.basketItems).values({ name: deal.title, quantity: 1, unit: deal.unitLabel, sourceDealId: deal.id }).returning({ id: schema.basketItems.id });
      const item = rows[0];
      if (!item) throw new Error("Deal could not be added");
      if (deal.finalPrice !== null) {
        const savings = knownDealSavings[deal.externalKey] ?? 0;
        await db.insert(schema.quotes).values({ basketItemId: item.id, retailer: deal.retailer, unitPrice: deal.finalPrice + savings, savings, sourceLabel: `${deal.sourceName} · matched deal` });
      }
      ctx.invalidateQueries();
      return { id: item.id };
    },
  }),

  updateBasketItem: defineAction({
    request: z.object({ id: z.number().int().positive(), quantity: z.number().int().min(1).max(99).optional(), checked: z.boolean().optional() }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const patch: { quantity?: number; checked?: boolean } = {};
      if (args.quantity !== undefined) patch.quantity = args.quantity;
      if (args.checked !== undefined) patch.checked = args.checked;
      await ctx.db<typeof schema>().update(schema.basketItems).set(patch).where(eq(schema.basketItems.id, args.id));
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  removeBasketItem: defineAction({
    request: z.object({ id: z.number().int().positive() }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      await ctx.db<typeof schema>().delete(schema.basketItems).where(eq(schema.basketItems.id, args.id));
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  setQuote: defineAction({
    request: z.object({ basketItemId: z.number().int().positive(), retailer: z.enum(retailerValues), unitPrice: z.number().nonnegative().max(10000), savings: z.number().nonnegative().max(10000).default(0) }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const db = ctx.db<typeof schema>();
      const existing = await db.select().from(schema.quotes).where(and(eq(schema.quotes.basketItemId, args.basketItemId), eq(schema.quotes.retailer, args.retailer))).limit(1);
      if (existing[0]) {
        await db.update(schema.quotes).set({ unitPrice: args.unitPrice, savings: args.savings, sourceLabel: "Shopper-confirmed", updatedAt: new Date() }).where(eq(schema.quotes.id, existing[0].id));
      } else {
        await db.insert(schema.quotes).values({ basketItemId: args.basketItemId, retailer: args.retailer, unitPrice: args.unitPrice, savings: args.savings, sourceLabel: "Shopper-confirmed" });
      }
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  setDeliveryFee: defineAction({
    request: z.object({ retailer: z.enum(retailerValues), amount: z.number().nonnegative().max(500) }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const db = ctx.db<typeof schema>();
      await db.insert(schema.deliveryFees).values({ retailer: args.retailer, amount: args.amount }).onConflictDoUpdate({ target: schema.deliveryFees.retailer, set: { amount: args.amount, updatedAt: new Date() } });
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),

  chooseCheckout: defineAction({
    request: z.object({ retailer: z.enum(retailerValues) }),
    response: z.object({ locked: z.boolean(), orderUrl: z.string().nullable(), storeName: z.string(), lines: z.array(z.string()), quotedTotal: z.number().nullable(), priceUpdatedFrom: z.string().nullable(), priceUpdatedThrough: z.string().nullable() }),
    async handler(ctx, args) {
      const plan = await loadPlan(ctx);
      const requestedStore = stores.find((candidate) => candidate.id === args.retailer);
      if (plan.tier !== "saver") {
        return { locked: true, orderUrl: null, storeName: requestedStore?.name ?? "Store", lines: [], quotedTotal: null, priceUpdatedFrom: null, priceUpdatedThrough: null };
      }
      const db = ctx.db<typeof schema>();
      const itemRows = await db.select().from(schema.basketItems).where(eq(schema.basketItems.checked, false)).orderBy(asc(schema.basketItems.createdAt));
      const quoteRows = await db.select().from(schema.quotes).where(eq(schema.quotes.retailer, args.retailer));
      const feeRows = await db.select().from(schema.deliveryFees).where(eq(schema.deliveryFees.retailer, args.retailer)).limit(1);
      let quotedTotal: number | null = 0;
      for (const item of itemRows) {
        const quote = quoteRows.find((candidate) => candidate.basketItemId === item.id);
        if (!quote) { quotedTotal = null; break; }
        if (quotedTotal !== null) quotedTotal += (quote.unitPrice - quote.savings) * item.quantity;
      }
      if (quotedTotal !== null) quotedTotal += feeRows[0]?.amount ?? 0;
      await db.insert(schema.checkoutSelections).values({ retailer: args.retailer, itemCount: itemRows.length, quotedTotal });
      const store = stores.find((candidate) => candidate.id === args.retailer) ?? stores[0];
      if (!store) throw new Error("Store unavailable");
      const priceDates = [...quoteRows.map((quote) => quote.updatedAt.toISOString()), ...(feeRows[0] ? [feeRows[0].updatedAt.toISOString()] : [])].sort();
      return { locked: false, orderUrl: store.orderUrl, storeName: store.name, lines: itemRows.map((item) => {
        const quote = quoteRows.find((candidate) => candidate.basketItemId === item.id);
        if (!quote) return `${item.quantity} ${item.unit} — ${item.name} · price missing`;
        const before = quote.unitPrice * item.quantity;
        const saved = quote.savings * item.quantity;
        return `${item.quantity} ${item.unit} — ${item.name} · ${before.toFixed(2)} − ${saved.toFixed(2)} coupons = ${(before - saved).toFixed(2)} · updated ${quote.updatedAt.toISOString().slice(0, 10)}`;
      }), quotedTotal, priceUpdatedFrom: priceDates[0] ?? null, priceUpdatedThrough: priceDates.at(-1) ?? null };
    },
  }),

  refreshDeals: defineAction({
    request: z.object({ includeBaseline: z.boolean().default(false) }),
    response: z.object({ ok: z.literal(true), added: z.number(), checkedSources: z.number(), storesChecked: z.number(), storesWithDeals: z.number(), message: z.string() }),
    async handler(ctx, args): Promise<{ ok: true; added: number; checkedSources: number; storesChecked: number; storesWithDeals: number; message: string }> {
      const db = ctx.db<typeof schema>();
      let added = 0;
      let checkedSources = 0;
      const now = new Date();
      // The curated, sourced baseline is always upserted so expired rows are
      // replaced by the current week's researched deals on every refresh,
      // including the weekly scheduled run. Older rows that are no longer in
      // the curated set stay in the feed and render as expired, not deleted.
      void args.includeBaseline;
      for (const deal of baselineDeals) {
        await db.insert(schema.deals).values({ ...deal, refreshedAt: now }).onConflictDoUpdate({ target: schema.deals.externalKey, set: { ...deal, refreshedAt: now } });
        added += 1;
      }
      // Max haul: one targeted search + extraction per retailer, so every
      // one of the 17 stores is checked every run and no store's feed goes
      // thin because a single combined query favored other chains. Extracted
      // deals are deduplicated against the feed by retailer + normalized
      // title and validated against the exact source URLs the search
      // returned. Nothing is invented: a store with no usable results gets a
      // recorded check (deal_feed_checks) with an explanatory note instead
      // of filler deals, and that note is shown in the coupon directory.
      const existingRows = await db.select().from(schema.deals);
      const knownTitles = new Set(existingRows.map((row) => `${row.retailer}|${normalizedProductText(row.title)}`));
      let storesWithDeals = 0;
      const emptyStoreNames: string[] = [];
      for (const store of stores) {
        let note: string | null = null;
        try {
          const query = `${store.name} weekly deals digital coupons coupon matchups this week October 2026 Krazy Coupon Lady Hip2Save`;
          const search = await ctx.tool.web_search(query);
          const candidates = search.content.results.filter((result) => result.url && result.snippet).slice(0, 8);
          checkedSources += candidates.length;
          if (candidates.length === 0) {
            note = "No couponing sources returned results for this store in this week's check — nothing was added, and nothing was invented to fill the gap.";
          } else {
            const allowedUrls = new Set(candidates.map((candidate) => candidate.url).filter((url): url is string => typeof url === "string"));
            const extracted = await ctx.inference.complete(
              `Extract current grocery or household deals for ${store.name} ONLY (retailer id "${store.id}") from these web search results. Aim for up to 10 deals — the strongest coupon stacks, freebies, and sale prices with explicit prices or explicit coupon amounts. For every deal include: the exact items and quantities required; every coupon needed (digital, paper, store, or app) and where to clip or find it; the sale price and the final out-of-pocket price — finalPrice must be null when the source does not state a shelf or sale price, never compute one yourself; explicit start and end dates only when the source states them (null otherwise); and a caveat carrying every uncertainty the source carries (regional variation, account-only offers, while supplies last, rebates paid later). Preserve each deal's exact source URL from the results below. Do not include deals for any other retailer, and do not invent prices, dates, or coupons.\n\n${candidates.map((candidate) => `TITLE: ${candidate.title}\nURL: ${candidate.url ?? ""}\nSOURCE: ${candidate.source ?? ""}\nSNIPPET: ${candidate.snippet ?? ""}`).join("\n\n")}`,
              { schema: z.object({ deals: z.array(dealShape).max(10) }) },
            );
            for (const deal of extracted.deals) {
              if (deal.retailer !== store.id) continue;
              if (!allowedUrls.has(deal.sourceUrl)) continue;
              const titleKey = `${store.id}|${normalizedProductText(deal.title)}`;
              if (knownTitles.has(titleKey)) continue;
              knownTitles.add(titleKey);
              const externalKey = `search-${deal.retailer}-${deal.sourceUrl}-${deal.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 180);
              await db.insert(schema.deals).values({ ...deal, externalKey, confidence: "indexed", refreshedAt: now }).onConflictDoUpdate({ target: schema.deals.externalKey, set: { ...deal, confidence: "indexed", refreshedAt: now } });
              added += 1;
            }
          }
        } catch {
          note = "This week's source check for this store could not be completed — the previously sourced offers were kept unchanged and nothing was invented.";
        }
        const storeRows = await db.select().from(schema.deals).where(eq(schema.deals.retailer, store.id));
        const currentCount = storeRows.filter((deal) => isDealCurrent(deal)).length;
        if (currentCount > 0) storesWithDeals += 1;
        else emptyStoreNames.push(store.name);
        if (note === null && currentCount === 0) {
          note = "No current deals were found in this week's couponing sources for this store — recorded as found, not filled in. Expired offers stay visible below, labeled expired; check the store's own weekly ad for anything the coupon blogs have not covered yet.";
        }
        await db.insert(schema.dealFeedChecks).values({ retailer: store.id, checkedAt: now, currentDeals: currentCount, note });
      }
      const refreshedDeals = await db.select().from(schema.deals);
      const basketRows = await db.select().from(schema.basketItems);
      const quoteRows = await db.select().from(schema.quotes);
      const refreshPlan = await loadPlan(ctx);
      for (const deal of refreshPlan.tier === "saver" ? refreshedDeals : []) {
        if (deal.finalPrice === null || !isDealCurrent(deal)) continue;
        const matchedProducts = catalog.filter((product) => dealAppliesToProduct(deal, product));
        for (const product of matchedProducts) {
          for (const basketItem of basketRows.filter((item) => item.name === product.name)) {
            const existing = quoteRows.find((quote) => quote.basketItemId === basketItem.id && quote.retailer === deal.retailer);
            const patch = { unitPrice: deal.finalPrice, savings: 0, sourceLabel: `${deal.sourceName} sale · updated ${deal.refreshedAt.toISOString().slice(0, 10)}`, updatedAt: deal.refreshedAt };
            if (existing) await db.update(schema.quotes).set(patch).where(eq(schema.quotes.id, existing.id));
            else await db.insert(schema.quotes).values({ basketItemId: basketItem.id, retailer: deal.retailer, ...patch });
          }
        }
      }
      ctx.invalidateQueries();
      const message = emptyStoreNames.length === 0
        ? `Weekly haul complete: all ${stores.length} stores checked and every store has current sourced deals (${refreshedDeals.length} offers in the feed).`
        : `Weekly haul complete: ${stores.length} stores checked; ${storesWithDeals} have current sourced deals. No current deals found for ${emptyStoreNames.join(", ")} — recorded in the feed, not invented. ${refreshedDeals.length} offers are in the feed, expired ones labeled.`;
      return { ok: true, added, checkedSources, storesChecked: stores.length, storesWithDeals, message };
    },
  }),

  getBilling: defineAction({
    request: z.object({}),
    response: billingResponse,
    async handler(ctx): Promise<z.infer<typeof billingResponse>> {
      const db = ctx.db<typeof schema>();
      const billingRows = await db.select().from(schema.billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(schema.subscriptions).limit(1);
      const sub = subRows[0];
      return {
        configured: Boolean(billing?.paymentLinkUrl && billing?.stripeSecretKey),
        publishableKey: billing?.stripePublishableKey ?? null,
        paymentLinkUrl: billing?.paymentLinkUrl ?? null,
        secretKeySet: Boolean(billing?.stripeSecretKey),
        subscription: sub ? { status: sub.status, email: sub.email, currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null, cancelAtPeriodEnd: sub.cancelAtPeriodEnd } : null,
      };
    },
  }),

  saveStripeSettings: defineAction({
    request: z.object({
      publishableKey: z.string().max(200).optional(),
      paymentLinkUrl: z.string().max(300).optional(),
      secretKey: z.string().max(300).optional(),
    }),
    response: z.object({ ok: z.literal(true), configured: z.boolean() }),
    async handler(ctx, args): Promise<{ ok: true; configured: boolean }> {
      const db = ctx.db<typeof schema>();
      const existingRows = await db.select().from(schema.billingSettings).limit(1);
      const existing = existingRows[0];
      const publishableKey = args.publishableKey !== undefined ? (args.publishableKey.trim() || null) : (existing?.stripePublishableKey ?? null);
      const paymentLinkUrl = args.paymentLinkUrl !== undefined ? (args.paymentLinkUrl.trim() || null) : (existing?.paymentLinkUrl ?? null);
      const secretKey = args.secretKey !== undefined ? (args.secretKey.trim() || null) : (existing?.stripeSecretKey ?? null);
      if (paymentLinkUrl && !paymentLinkUrl.startsWith("https://")) throw new Error("The payment link must be a full https:// URL from your Stripe dashboard.");
      await db.insert(schema.billingSettings).values({ id: 1, stripePublishableKey: publishableKey, stripeSecretKey: secretKey, paymentLinkUrl }).onConflictDoUpdate({
        target: schema.billingSettings.id,
        set: { stripePublishableKey: publishableKey, stripeSecretKey: secretKey, paymentLinkUrl, updatedAt: new Date() },
      });
      ctx.invalidateQueries();
      return { ok: true, configured: Boolean(paymentLinkUrl && secretKey) };
    },
  }),

  verifySubscription: defineAction({
    request: z.object({ email: z.string().email().max(200) }),
    response: z.object({ status: z.enum(["active", "trialing", "not_found", "not_configured", "error"]), message: z.string(), currentPeriodEnd: z.string().nullable() }),
    async handler(ctx, args): Promise<{ status: "active" | "trialing" | "not_found" | "not_configured" | "error"; message: string; currentPeriodEnd: string | null }> {
      const db = ctx.db<typeof schema>();
      const billingRows = await db.select().from(schema.billingSettings).limit(1);
      const billing = billingRows[0];
      if (!billing?.stripeSecretKey) return { status: "not_configured", message: "Stripe is not connected yet. The app owner needs to add their Stripe keys in the plan setup first.", currentPeriodEnd: null };
      const customers = await stripeGet(billing.stripeSecretKey, "customers", { email: args.email, limit: "5" });
      if (!customers.ok) return { status: "error", message: `Stripe lookup failed: ${stripeErrorMessage(customers.body)}`, currentPeriodEnd: null };
      const customerList = (customers.body.data as Array<{ id: string }> | undefined) ?? [];
      for (const customer of customerList) {
        const subs = await stripeGet(billing.stripeSecretKey, "subscriptions", { customer: customer.id, status: "all", limit: "10" });
        if (!subs.ok) continue;
        const subList = (subs.body.data as StripeSubscription[] | undefined) ?? [];
        const live = subList.find((sub) => sub.status === "active" || sub.status === "trialing");
        if (live) {
          const periodEnd = live.current_period_end ? new Date(live.current_period_end * 1000) : null;
          await saveSubscriptionRow(ctx, {
            email: args.email,
            status: live.status === "trialing" ? "trialing" : "active",
            stripeCustomerId: customer.id,
            stripeSubscriptionId: live.id,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: Boolean(live.cancel_at_period_end),
          });
          ctx.invalidateQueries();
          return { status: live.status === "trialing" ? "trialing" : "active", message: "Subscription confirmed with Stripe. Checkout Saver is on.", currentPeriodEnd: periodEnd?.toISOString() ?? null };
        }
      }
      return { status: "not_found", message: "No active Stripe subscription was found for that email. Subscribe with the payment link first, using the same email.", currentPeriodEnd: null };
    },
  }),

  refreshSubscriptionStatus: defineAction({
    request: z.object({}),
    response: z.object({ status: z.string(), message: z.string(), currentPeriodEnd: z.string().nullable() }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const billingRows = await db.select().from(schema.billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(schema.subscriptions).limit(1);
      const sub = subRows[0];
      if (!billing?.stripeSecretKey || !sub?.stripeSubscriptionId) {
        return { status: sub?.status ?? "none", message: "Nothing to refresh yet — no Stripe subscription is linked.", currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null };
      }
      const result = await stripeGet(billing.stripeSecretKey, `subscriptions/${sub.stripeSubscriptionId}`, {});
      if (!result.ok) return { status: sub.status, message: `Stripe lookup failed: ${stripeErrorMessage(result.body)}`, currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null };
      const live = result.body as unknown as StripeSubscription;
      const known = ["active", "trialing", "past_due", "canceled", "incomplete"] as const;
      const status = known.find((candidate) => candidate === live.status) ?? "incomplete";
      const periodEnd = live.current_period_end ? new Date(live.current_period_end * 1000) : null;
      await saveSubscriptionRow(ctx, {
        email: sub.email,
        status,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: Boolean(live.cancel_at_period_end),
      });
      ctx.invalidateQueries();
      return { status, message: "Subscription status refreshed from Stripe.", currentPeriodEnd: periodEnd?.toISOString() ?? null };
    },
  }),

  cancelSubscription: defineAction({
    request: z.object({}),
    response: z.object({ ok: z.boolean(), message: z.string() }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const billingRows = await db.select().from(schema.billingSettings).limit(1);
      const billing = billingRows[0];
      const subRows = await db.select().from(schema.subscriptions).limit(1);
      const sub = subRows[0];
      if (!billing?.stripeSecretKey || !sub?.stripeSubscriptionId) return { ok: false, message: "No linked Stripe subscription to cancel." };
      const result = await stripeRequest(billing.stripeSecretKey, `subscriptions/${sub.stripeSubscriptionId}`, { cancel_at_period_end: "true" });
      if (!result.ok) return { ok: false, message: `Stripe did not accept the cancellation: ${stripeErrorMessage(result.body)}` };
      await saveSubscriptionRow(ctx, {
        email: sub.email,
        status: sub.status,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: true,
      });
      ctx.invalidateQueries();
      return { ok: true, message: "Cancellation scheduled in Stripe. Saver stays on until the end of the current billing period." };
    },
  }),

  markAlertSeen: defineAction({
    request: z.object({ dealId: z.number().int().positive() }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const db = ctx.db<typeof schema>();
      await db.insert(schema.alertSeen).values({ dealId: args.dealId }).onConflictDoNothing();
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),
} satisfies ActionsModule;
