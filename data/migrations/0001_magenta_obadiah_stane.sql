CREATE TABLE `nt_configuration` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`selected` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nt_sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`script_id` text NOT NULL,
	`hospital_id` text NOT NULL,
	`country_iso` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nt_sessions_session_id_unique` ON `nt_sessions` (`session_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_nt_config_keys` (
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
INSERT INTO `__new_nt_config_keys`("id", "config_key_id", "old_config_key_id", "position", "version", "key", "label", "summary", "source", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at") SELECT "id", "config_key_id", "old_config_key_id", "position", "version", "key", "label", "summary", "source", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at" FROM `nt_config_keys`;--> statement-breakpoint
DROP TABLE `nt_config_keys`;--> statement-breakpoint
ALTER TABLE `__new_nt_config_keys` RENAME TO `nt_config_keys`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_config_key_id_unique` ON `nt_config_keys` (`config_key_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_old_config_key_id_unique` ON `nt_config_keys` (`old_config_key_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_key_unique` ON `nt_config_keys` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_config_keys_label_unique` ON `nt_config_keys` (`label`);--> statement-breakpoint
CREATE TABLE `__new_nt_diagnoses` (
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
INSERT INTO `__new_nt_diagnoses`("id", "diagnosis_id", "old_diagnosis_id", "old_script_id", "version", "script_id", "position", "source", "expression", "name", "description", "key", "severity_order", "expression_meaning", "symptoms", "text1", "text2", "text3", "image1", "image2", "image3", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at") SELECT "id", "diagnosis_id", "old_diagnosis_id", "old_script_id", "version", "script_id", "position", "source", "expression", "name", "description", "key", "severity_order", "expression_meaning", "symptoms", "text1", "text2", "text3", "image1", "image2", "image3", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at" FROM `nt_diagnoses`;--> statement-breakpoint
DROP TABLE `nt_diagnoses`;--> statement-breakpoint
ALTER TABLE `__new_nt_diagnoses` RENAME TO `nt_diagnoses`;--> statement-breakpoint
CREATE UNIQUE INDEX `nt_diagnoses_diagnosis_id_unique` ON `nt_diagnoses` (`diagnosis_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_diagnoses_old_diagnosis_id_unique` ON `nt_diagnoses` (`old_diagnosis_id`);--> statement-breakpoint
CREATE TABLE `__new_nt_screens` (
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
INSERT INTO `__new_nt_screens`("id", "screen_id", "old_screen_id", "old_script_id", "version", "script_id", "type", "position", "source", "section_title", "preview_title", "preview_print_title", "condition", "skip_to_condition", "skip_to_screen_id", "epic_id", "story_id", "ref_id", "ref_key", "step", "action_text", "content_text", "info_text", "title", "title1", "title2", "title3", "title4", "text1", "text2", "text3", "image1", "image2", "image3", "instructions", "instructions2", "instructions3", "instructions4", "hcw_diagnoses_instructions", "suggested_diagnoses_instructions", "notes", "data_type", "key", "label", "negative_label", "positive_label", "timer_value", "multiplier", "min_value", "max_value", "exportable", "printable", "skippable", "confidential", "pre_populate", "fields", "items", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at") SELECT "id", "screen_id", "old_screen_id", "old_script_id", "version", "script_id", "type", "position", "source", "section_title", "preview_title", "preview_print_title", "condition", "skip_to_condition", "skip_to_screen_id", "epic_id", "story_id", "ref_id", "ref_key", "step", "action_text", "content_text", "info_text", "title", "title1", "title2", "title3", "title4", "text1", "text2", "text3", "image1", "image2", "image3", "instructions", "instructions2", "instructions3", "instructions4", "hcw_diagnoses_instructions", "suggested_diagnoses_instructions", "notes", "data_type", "key", "label", "negative_label", "positive_label", "timer_value", "multiplier", "min_value", "max_value", "exportable", "printable", "skippable", "confidential", "pre_populate", "fields", "items", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at" FROM `nt_screens`;--> statement-breakpoint
DROP TABLE `nt_screens`;--> statement-breakpoint
ALTER TABLE `__new_nt_screens` RENAME TO `nt_screens`;--> statement-breakpoint
CREATE UNIQUE INDEX `nt_screens_screen_id_unique` ON `nt_screens` (`screen_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_screens_old_screen_id_unique` ON `nt_screens` (`old_screen_id`);--> statement-breakpoint
CREATE TABLE `__new_nt_scripts` (
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
INSERT INTO `__new_nt_scripts`("id", "script_id", "old_script_id", "version", "type", "position", "source", "title", "print_title", "description", "hospital_id", "exportable", "nuid_search_enabled", "nuid_search_fields", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at") SELECT "id", "script_id", "old_script_id", "version", "type", "position", "source", "title", "print_title", "description", "hospital_id", "exportable", "nuid_search_enabled", "nuid_search_fields", "preferences", "is_draft", "publish_date", "created_at", "updated_at", "deleted_at" FROM `nt_scripts`;--> statement-breakpoint
DROP TABLE `nt_scripts`;--> statement-breakpoint
ALTER TABLE `__new_nt_scripts` RENAME TO `nt_scripts`;--> statement-breakpoint
CREATE UNIQUE INDEX `nt_scripts_script_id_unique` ON `nt_scripts` (`script_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `nt_scripts_old_script_id_unique` ON `nt_scripts` (`old_script_id`);