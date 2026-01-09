import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import db from '@/data/db';
import migrations from '@/data/db/migrations/migrations';

export function useDataMigrations() {
	const { success, error, } = useMigrations(db, migrations);
	return {
		success,
		error,
		loading: !success ? !error : false,
	};
}
