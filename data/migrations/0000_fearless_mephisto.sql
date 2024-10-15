CREATE TABLE `nt_hospitals` (
	`id` integer,
	`hospital_id` text NOT NULL,
	`old_hospital_id` text,
	`name` text NOT NULL,
	`country` text DEFAULT '',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_hospital_id_unique` ON `nt_hospitals` (`hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_old_hospital_id_unique` ON `nt_hospitals` (`old_hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_name_unique` ON `nt_hospitals` (`name`);