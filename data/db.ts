import { SQL, sql, getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

const isProd = process.env.NODE_ENV === 'production';

declare global {
    var drizzle: ReturnType<typeof dbInit> | undefined;
}

function dbInit() {
    const expo = openDatabaseSync("neotree.db");
    const db = drizzle(expo, { 
        // schema, 
        // logger: !isProd, 
    });
    return db;
}

const db = globalThis.drizzle || dbInit();

if (!isProd) globalThis.drizzle = db;

const buildConflictUpdateColumns = <
    T extends SQLiteTable,
    Q extends keyof T['_']['columns']
>(
    table: T,
    columns: Q[],
) => {
    const cls = getTableColumns(table);
    return columns.reduce((acc, column) => {
        const colName = cls[column].name;
        acc[column] = sql.raw(`excluded.${colName}`);
        return acc;
    }, {} as Record<Q, SQL>);
};

export { db, buildConflictUpdateColumns, };