import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from '@/data/db/schema';

const expo = openDatabaseSync("neotree.db", {
	enableChangeListener: true,
});

const db = drizzle(expo, {
	logger: process.env.EXPO_PUBLIC_DB_LOGGER === 'true',
	schema,
});

export default db;
