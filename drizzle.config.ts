import type { Config } from 'drizzle-kit';

export default {
    schema: './data/schema.ts',
    out: './data/migrations',
    dialect: 'sqlite',
    driver: 'expo',
} satisfies Config;