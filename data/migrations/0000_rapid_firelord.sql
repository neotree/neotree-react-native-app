CREATE TABLE `nt_config_keys` (
	`id` integer PRIMARY KEY NOT NULL,
	`config_key_id` text NOT NULL,
	`old_config_key_id` text,
	`position` integer NOT NULL,
	`version` integer NOT NULL,
	`key` text NOT NULL,
	`label` text NOT NULL,
	`summary` text NOT NULL,
	`source` text DEFAULT 'editor',
	`preferences` text DEFAULT '{}' NOT NULL,
	`is_draft` integer DEFAULT 0 NOT NULL,
	`publish_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_config_key_id_unique` ON `nt_config_keys` (`config_key_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_old_config_key_id_unique` ON `nt_config_keys` (`old_config_key_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_key_unique` ON `nt_config_keys` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_label_unique` ON `nt_config_keys` (`label`);--> statement-breakpoint
CREATE TABLE `nt_configuration` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`selected` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nt_diagnoses` (
	`id` integer PRIMARY KEY NOT NULL,
	`diagnosis_id` text NOT NULL,
	`old_diagnosis_id` text,
	`old_script_id` text,
	`version` integer NOT NULL,
	`script_id` text NOT NULL,
	`position` integer NOT NULL,
	`source` text DEFAULT 'editor',
	`expression` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`key` text DEFAULT '',
	`severity_order` integer,
	`expression_meaning` text DEFAULT '' NOT NULL,
	`symptoms` text DEFAULT '[]' NOT NULL,
	`text1` text DEFAULT '' NOT NULL,
	`text2` text DEFAULT '' NOT NULL,
	`text3` text DEFAULT '' NOT NULL,
	`image1` text,
	`image2` text,
	`image3` text,
	`preferences` text DEFAULT '{}' NOT NULL,
	`is_draft` integer DEFAULT 0 NOT NULL,
	`publish_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`script_id`) REFERENCES `nt_scripts`(`script_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_diagnoses_diagnosis_id_unique` ON `nt_diagnoses` (`diagnosis_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_diagnoses_old_diagnosis_id_unique` ON `nt_diagnoses` (`old_diagnosis_id`);--> statement-breakpoint
CREATE TABLE `nt_hospitals` (
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
CREATE UNIQUE INDEX `nt_hospitals_hospital_id_unique` ON `nt_hospitals` (`hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_old_hospital_id_unique` ON `nt_hospitals` (`old_hospital_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_hospitals_name_unique` ON `nt_hospitals` (`name`);--> statement-breakpoint
CREATE TABLE `nt_screens` (
	`id` integer PRIMARY KEY NOT NULL,
	`screen_id` text NOT NULL,
	`old_screen_id` text,
	`old_script_id` text,
	`version` integer NOT NULL,
	`script_id` text NOT NULL,
	`type` text NOT NULL,
	`position` integer NOT NULL,
	`source` text DEFAULT 'editor',
	`section_title` text NOT NULL,
	`preview_title` text DEFAULT '' NOT NULL,
	`preview_print_title` text DEFAULT '' NOT NULL,
	`condition` text DEFAULT '' NOT NULL,
	`skip_to_condition` text DEFAULT '' NOT NULL,
	`skip_to_screen_id` text,
	`epic_id` text DEFAULT '' NOT NULL,
	`story_id` text DEFAULT '' NOT NULL,
	`ref_id` text DEFAULT '' NOT NULL,
	`ref_key` text DEFAULT '' NOT NULL,
	`step` text DEFAULT '' NOT NULL,
	`action_text` text DEFAULT '' NOT NULL,
	`content_text` text DEFAULT '' NOT NULL,
	`info_text` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`title1` text DEFAULT '' NOT NULL,
	`title2` text DEFAULT '' NOT NULL,
	`title3` text DEFAULT '' NOT NULL,
	`title4` text DEFAULT '' NOT NULL,
	`text1` text DEFAULT '' NOT NULL,
	`text2` text DEFAULT '' NOT NULL,
	`text3` text DEFAULT '' NOT NULL,
	`image1` text,
	`image2` text,
	`image3` text,
	`instructions` text DEFAULT '' NOT NULL,
	`instructions2` text DEFAULT '' NOT NULL,
	`instructions3` text DEFAULT '' NOT NULL,
	`instructions4` text DEFAULT '' NOT NULL,
	`hcw_diagnoses_instructions` text DEFAULT '' NOT NULL,
	`suggested_diagnoses_instructions` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`data_type` text DEFAULT '' NOT NULL,
	`key` text DEFAULT '' NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`negative_label` text DEFAULT '' NOT NULL,
	`positive_label` text DEFAULT '' NOT NULL,
	`timer_value` integer,
	`multiplier` integer,
	`min_value` integer,
	`max_value` integer,
	`exportable` integer DEFAULT 1 NOT NULL,
	`printable` integer,
	`skippable` integer DEFAULT 0 NOT NULL,
	`confidential` integer DEFAULT 0 NOT NULL,
	`pre_populate` text DEFAULT '[]' NOT NULL,
	`fields` text DEFAULT '[]' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`preferences` text DEFAULT '{}' NOT NULL,
	`is_draft` integer DEFAULT 0 NOT NULL,
	`publish_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`script_id`) REFERENCES `nt_scripts`(`script_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_screens_screen_id_unique` ON `nt_screens` (`screen_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_screens_old_screen_id_unique` ON `nt_screens` (`old_screen_id`);--> statement-breakpoint
CREATE TABLE `nt_scripts` (
	`id` integer PRIMARY KEY NOT NULL,
	`script_id` text NOT NULL,
	`old_script_id` text,
	`version` integer NOT NULL,
	`type` text DEFAULT 'admission' NOT NULL,
	`position` integer NOT NULL,
	`source` text DEFAULT 'editor',
	`title` text NOT NULL,
	`print_title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`hospital_id` text,
	`exportable` integer DEFAULT 1 NOT NULL,
	`nuid_search_enabled` integer DEFAULT 0 NOT NULL,
	`nuid_search_fields` text DEFAULT '[]' NOT NULL,
	`preferences` text DEFAULT '{}' NOT NULL,
	`is_draft` integer DEFAULT 0 NOT NULL,
	`publish_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_scripts_script_id_unique` ON `nt_scripts` (`script_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_scripts_old_script_id_unique` ON `nt_scripts` (`old_script_id`);--> statement-breakpoint
CREATE TABLE `nt_sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`script_id` text NOT NULL,
	`hospital_id` text NOT NULL,
	`country_iso` text NOT NULL,
	`neotree_id` text NOT NULL,
	`title` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`exported_at` text,
	`completed_at` text,
	`canceled_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_sessions_session_id_unique` ON `nt_sessions` (`session_id`);