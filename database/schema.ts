import { 
    boolean,
    index,
    integer, 
    jsonb, 
    pgTable, 
    serial, 
    text, 
    timestamp, 
    uuid,
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

// HOSPITALS
export const hospitals = pgTable(
    'nt_hospitals', 
    {
        id: integer('id'),
        hospitalId: uuid('hospital_id').notNull().unique(),
        oldHospitalId: text('old_hospital_id').unique(),
        name: text('name').notNull().unique(),
        country: text('country').default(''),
        
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
        deletedAt: timestamp('deleted_at'),
    },
);