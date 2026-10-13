CREATE TABLE `scanned_products` (
  `upc` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `unit` text DEFAULT 'item' NOT NULL,
  `base_price` real NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
