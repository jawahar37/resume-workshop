CREATE TABLE `bullet_tags` (
	`bullet_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`bullet_id`, `tag_id`),
	FOREIGN KEY (`bullet_id`) REFERENCES `bullets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bullets` (
	`id` text PRIMARY KEY NOT NULL,
	`experience_id` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `education` (
	`id` text PRIMARY KEY NOT NULL,
	`institution` text NOT NULL,
	`degree` text NOT NULL,
	`field` text,
	`start_date` text,
	`end_date` text,
	`location` text,
	`order_index` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role_title` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`location` text,
	`summary` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `jd_requirement_tags` (
	`requirement_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`requirement_id`, `tag_id`),
	FOREIGN KEY (`requirement_id`) REFERENCES `jd_requirements`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jd_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`jd_id` text NOT NULL,
	`text` text NOT NULL,
	`weight` text DEFAULT 'medium' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`jd_id`) REFERENCES `job_descriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `job_descriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`role_title` text NOT NULL,
	`raw_text` text NOT NULL,
	`url` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `personal_info` (
	`id` text PRIMARY KEY DEFAULT 'primary' NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`location` text,
	`website` text,
	`github` text,
	`linkedin` text,
	`summary` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `profile_bullets` (
	`profile_id` text NOT NULL,
	`bullet_id` text NOT NULL,
	`text_override` text,
	`override_order` integer,
	PRIMARY KEY(`profile_id`, `bullet_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `target_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bullet_id`) REFERENCES `bullets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`items` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `target_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target_role` text NOT NULL,
	`summary` text,
	`max_pages` integer DEFAULT 1 NOT NULL,
	`tag_weights` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
