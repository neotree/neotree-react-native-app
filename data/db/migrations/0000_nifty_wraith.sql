CREATE TABLE `aliases` (
	`id` integer NOT NULL,
	`scriptid` text,
	`old_script` text,
	`alias` text,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aliases_scriptid_unique` ON `aliases` (`scriptid`);--> statement-breakpoint
CREATE UNIQUE INDEX `aliases_name_unique` ON `aliases` (`name`);--> statement-breakpoint
CREATE TABLE `config_keys` (
	`id` integer NOT NULL,
	`config_key_id` text NOT NULL,
	`position` integer,
	`data` blob NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configuration` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`data` blob NOT NULL,
	`created_at` text,
	`updated_at` text DEFAULT (CURRENT_DATE)
);
--> statement-breakpoint
CREATE TABLE `diagnoses` (
	`id` integer NOT NULL,
	`script_id` text NOT NULL,
	`diagnosis_id` text NOT NULL,
	`type` text,
	`position` integer,
	`data` blob NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drugs_library` (
	`id` integer NOT NULL,
	`item_id` text NOT NULL,
	`position` integer,
	`data` blob NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exceptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`country` text,
	`message` text,
	`stack` text,
	`device` text,
	`exported` text,
	`hospital` text,
	`version` text,
	`battery` text,
	`device_model` text,
	`memory` text,
	`editor_version` text
);
--> statement-breakpoint
CREATE TABLE `screens` (
	`id` integer NOT NULL,
	`script_id` text NOT NULL,
	`screen_id` text NOT NULL,
	`type` text,
	`position` integer,
	`data` blob NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` integer NOT NULL,
	`script_id` text NOT NULL,
	`type` text,
	`position` integer,
	`data` blob NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`script_id` text,
	`type` text,
	`uid` text,
	`data` blob NOT NULL,
	`completed` integer,
	`exported` integer,
	`created_at` text,
	`updated_at` text DEFAULT (CURRENT_DATE)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_id_unique` ON `sessions` (`session_id`);--> statement-breakpoint
CREATE TABLE `sessions_exports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`script_id` text,
	`uid` text,
	`data` blob NOT NULL,
	`ingested_at` text
);
