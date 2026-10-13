DROP TABLE IF EXISTS entries;
--> statement-breakpoint
CREATE TABLE deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_key TEXT NOT NULL UNIQUE,
  retailer TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  price_label TEXT NOT NULL,
  final_price REAL,
  unit_label TEXT NOT NULL DEFAULT 'item',
  coupon_steps TEXT NOT NULL,
  valid_from TEXT,
  valid_through TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  confidence TEXT NOT NULL,
  caveat TEXT,
  refreshed_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE basket_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'item',
  checked INTEGER NOT NULL DEFAULT 0,
  source_deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  basket_item_id INTEGER NOT NULL REFERENCES basket_items(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  unit_price REAL NOT NULL,
  savings REAL NOT NULL DEFAULT 0,
  source_label TEXT NOT NULL DEFAULT 'Shopper-entered',
  updated_at INTEGER NOT NULL,
  UNIQUE(basket_item_id, retailer)
);
--> statement-breakpoint
CREATE TABLE delivery_fees (
  retailer TEXT PRIMARY KEY,
  amount REAL NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE checkout_selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retailer TEXT NOT NULL,
  item_count INTEGER NOT NULL,
  quoted_total REAL,
  created_at INTEGER NOT NULL
);
