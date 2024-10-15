import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// HOSPITALS
export const hospitals = sqliteTable(
    'nt_hospitals', 
    {
        id: integer('id'),
        hospitalId: text('hospital_id').notNull().unique(),
        oldHospitalId: text('old_hospital_id').unique(),
        name: text('name').notNull().unique(),
        country: text('country').default(''),
        
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);