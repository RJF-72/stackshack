import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const retailerIds = ["walmart", "heb", "aldi", "united", "dollar_general", "family_dollar", "kroger", "publix", "safeway", "target", "meijer", "giant", "stop_shop", "food_lion", "costco", "sams_club", "piggly_wiggly"] as const;
export const regionIds = ["texas", "southeast", "northeast", "midwest", "west", "national"] as const;

export const deals = sqliteTable("deals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalKey: text("external_key").notNull().unique(),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  priceLabel: text("price_label").notNull(),
  finalPrice: real("final_price"),
  unitLabel: text("unit_label").notNull().default("item"),
  couponSteps: text("coupon_steps").notNull(),
  validFrom: text("valid_from"),
  validThrough: text("valid_through"),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  confidence: text("confidence", { enum: ["verified_live", "indexed"] }).notNull(),
  caveat: text("caveat"),
  refreshedAt: integer("refreshed_at", { mode: "timestamp_ms" }).notNull(),
});

export const dealFeedChecks = sqliteTable("deal_feed_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  checkedAt: integer("checked_at", { mode: "timestamp_ms" }).notNull(),
  currentDeals: integer("current_deals").notNull().default(0),
  note: text("note"),
});

export const scannedProducts = sqliteTable("scanned_products", {
  upc: text("upc").primaryKey(),
  name: text("name").notNull(),
  unit: text("unit").notNull().default("item"),
  basePrice: real("base_price").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const basketItems = sqliteTable("basket_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("item"),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  sourceDealId: integer("source_deal_id").references(() => deals.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  basketItemId: integer("basket_item_id").notNull().references(() => basketItems.id, { onDelete: "cascade" }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  unitPrice: real("unit_price").notNull(),
  savings: real("savings").notNull().default(0),
  sourceLabel: text("source_label").notNull().default("Shopper-entered"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const deliveryFees = sqliteTable("delivery_fees", {
  retailer: text("retailer", { enum: retailerIds }).primaryKey(),
  amount: real("amount").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const checkoutSelections = sqliteTable("checkout_selections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  retailer: text("retailer", { enum: retailerIds }).notNull(),
  itemCount: integer("item_count").notNull(),
  quotedTotal: real("quoted_total"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const billingSettings = sqliteTable("billing_settings", {
  id: integer("id").primaryKey(),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  paymentLinkUrl: text("payment_link_url"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey(),
  email: text("email"),
  status: text("status", { enum: ["none", "active", "trialing", "past_due", "canceled", "incomplete"] }).notNull().default("none"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const alertSeen = sqliteTable("alert_seen", {
  dealId: integer("deal_id").primaryKey().references(() => deals.id, { onDelete: "cascade" }),
  seenAt: integer("seen_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey(),
  region: text("region", { enum: regionIds }).notNull().default("texas"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});
