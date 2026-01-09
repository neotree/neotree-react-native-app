import { sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type * as types from '@/data/types';

export const sessions = sqliteTable(
	'sessions',
	{
		id: integer('id').primaryKey({ autoIncrement: true, }).notNull(),
		sessionId: text('session_id').notNull().unique(),
		scriptId: text('script_id'),
		type: text('type'),
		uid: text('uid'),
		data: blob('data', { mode: 'json', }).notNull().$type<types.SessionData>(),
		completed: integer('completed', { mode: 'boolean', }),
		exported: integer('exported', { mode: 'boolean', }),
		createdAt: text('created_at'),
		updatedAt: text('updated_at').default(sql`(CURRENT_DATE)`).$onUpdateFn(() => sql`(CURRENT_DATE)`),
	},
);

export const configuration = sqliteTable(
	'configuration',
	{
		id: integer('id').primaryKey({ autoIncrement: true, }).notNull(),
		data: blob('data', { mode: 'json', }).notNull(),
		createdAt: text('created_at'),
		updatedAt: text('updated_at').default(sql`(CURRENT_DATE)`).$onUpdateFn(() => sql`(CURRENT_DATE)`),
	},
);

export const sessionsExports = sqliteTable(
	'sessions_exports',
	{
		id: integer('id').primaryKey({ autoIncrement: true, }).notNull(),
		sessionId: integer('session_id').notNull(),
		scriptId: text('script_id'),
		uid: text('uid'),
		data: blob('data', { mode: 'json', }).notNull(),
		ingestedAt: text('ingested_at'),
	},
);

export const exceptions = sqliteTable(
	'exceptions',
	{
		id: integer('id').primaryKey({ autoIncrement: true, }).notNull(),
		country: text('country'),
		message: text('message'),
		stack: text('stack'),
		device: text('device'),
		exported: text('exported'),
		hospital: text('hospital'),
		version: text('version'),
		battery: text('battery'),
		deviceModel: text('device_model'),
		memory: text('memory'),
		editorVersion: text('editor_version'),
	},
);

export const scripts = sqliteTable(
	'scripts',
	{
		id: integer('id').notNull(),
		scriptId: text('script_id').notNull(),
		type: text('type'),
		position: integer('position'),
		data: blob('data', { mode: 'json', }).notNull().notNull().$type<types.Script>(),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
	},
);

export const screens = sqliteTable(
	'screens',
	{
		id: integer('id').notNull(),
		scriptId: text('script_id').notNull(),
		screenId: text('screen_id').notNull(),
		type: text('type'),
		position: integer('position'),
		data: blob('data', { mode: 'json', }).notNull().notNull().$type<types.Screen>(),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
	},
);

export const diagnoses = sqliteTable(
	'diagnoses',
	{
		id: integer('id').notNull(),
		scriptId: text('script_id').notNull(),
		diagnosisId: text('diagnosis_id').notNull(),
		type: text('type'),
		position: integer('position'),
		data: blob('data', { mode: 'json', }).notNull().notNull().$type<types.Diagnosis>(),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
	},
);

export const configKeys = sqliteTable(
	'config_keys',
	{
		id: integer('id').notNull(),
		configKeyId: text('config_key_id').notNull(),
		position: integer('position'),
		data: blob('data', { mode: 'json', }).notNull().notNull().$type<types.ConfigKey>(),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
	},
);

export const drugsLibrary = sqliteTable(
	'drugs_library',
	{
		id: integer('id').notNull(),
		itemId: text('item_id').notNull(),
		position: integer('position'),
		data: blob('data', { mode: 'json', }).notNull().notNull().$type<types.DrugsLibraryItem>(),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull(),
	},
);

export const aliases = sqliteTable(
	'aliases',
	{
		id: integer('id').notNull(),
		scriptId: text('scriptid').unique(),
		oldScript: text('old_script'),
		alias: text('alias'),
		name: text('name').unique(),
	},
);
