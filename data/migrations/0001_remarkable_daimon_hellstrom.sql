CREATE TABLE `nt_sites` (
	`id` integer PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`name` text NOT NULL,
	`link` text NOT NULL,
	`api_key` text NOT NULL,
	`type` text NOT NULL,
	`env` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_sites_site_id_unique` ON `nt_sites` (`site_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_sites_name_unique` ON `nt_sites` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_sites_link_unique` ON `nt_sites` (`link`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_nt_hospitals` (
	`id` integer PRIMARY KEY NOT NULL,
	`hospital_id` text NOT NULL,
	`old_hospital_id` text,
	`name` text NOT NULL,
	`country` text DEFAULT '',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_nt_hospitals`("id", "hospital_id", "old_hospital_id", "name", "country", "created_at", "updated_at", "deleted_at") SELECT "id", "hospital_id", "old_hospital_id", "name", "country", "created_at", "updated_at", "deleted_at" FROM `nt_hospitals`;--> statement-breakpoint
DROP TABLE `nt_hospitals`;--> statement-breakpoint
ALTER TABLE `__new_nt_hospitals` RENAME TO `nt_hospitals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_hospital_id_unique` ON `nt_hospitals` (`hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_old_hospital_id_unique` ON `nt_hospitals` (`old_hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_name_unique` ON `nt_hospitals` (`name`);