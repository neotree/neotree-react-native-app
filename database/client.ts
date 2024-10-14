import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";

import * as schema from './schema';

const isProd = process.env.NODE_ENV === 'production';

declare global {
    var drizzle: ReturnType<typeof dbInit> | undefined;
}

function dbInit() {
    const expo = openDatabaseSync("neotree.db");
    const db = drizzle(expo, { 
        schema, 
        logger: !isProd, 
    });
    return db;
}

const db = globalThis.drizzle || dbInit();

if (!isProd) globalThis.drizzle = db;

export { db };