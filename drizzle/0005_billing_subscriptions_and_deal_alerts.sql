CREATE TABLE `billing_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`stripe_publishable_key` text,
	`stripe_secret_key` text,
	`payment_link_url` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`status` text DEFAULT 'none' NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `alert_seen` (
	`deal_id` integer PRIMARY KEY NOT NULL REFERENCES `deals`(`id`) ON DELETE cascade,
	`seen_at` integer NOT NULL
);
