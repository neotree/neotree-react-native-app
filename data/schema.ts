import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// HOSPITALS
export const hospitals = sqliteTable(
    'nt_hospitals', 
    {
        id: integer('id').primaryKey(),
        hospitalId: text('hospital_id').notNull().unique(),
        oldHospitalId: text('old_hospital_id').unique(),
        name: text('name').notNull().unique(),
        country: text('country').default(''),
        
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);

// SITES
export const sites = sqliteTable('nt_sites', {
    id: integer('id').primaryKey(),
    siteId: text('site_id').notNull().unique(),
    name: text('name').notNull().unique(),
    link: text('link').notNull().unique(),
    apiKey: text('api_key').notNull(),
    type: text('type').notNull(),
    env: text('env').notNull(),
    
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
});