import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db, migrations } from '@/database';

export function useDatabase() {
    const { success, error } = useMigrations(db, migrations);

    return {
        databaseLoaded: success,
        loadDatabaseErrors: error ? [error.message] : undefined,
    };
}