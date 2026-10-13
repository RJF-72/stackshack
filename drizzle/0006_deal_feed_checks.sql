CREATE TABLE IF NOT EXISTS `deal_feed_checks` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `retailer` text NOT NULL,
  `checked_at` integer NOT NULL,
  `current_deals` integer DEFAULT 0 NOT NULL,
  `note` text
);
