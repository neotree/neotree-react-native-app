import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './data/db/schema.ts',
	out: './data/db/migrations',
	dialect: 'sqlite',
	driver: 'expo',
});
