import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";

import * as schema from './schema';

declare global {
    var drizzle: ReturnType<typeof dbInit> | undefined;
}

const isProd = process.env.NODE_ENV === 'production';

function dbInit() {
    const expo = openDatabaseSync("db.db");
    const db = drizzle(expo, { 
        schema, 
        logger: !isProd, 
    });
    return db;
}

const db = globalThis.drizzle || dbInit();

if (!isProd) globalThis.drizzle = db;

export * from './schema';

export default db;