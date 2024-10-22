import { eq, inArray } from "drizzle-orm";

import { db } from "../db";
import { configuration } from '../schema';

export async function saveConfiguration(data: typeof configuration.$inferInsert[]) {
    try {
        data = data.filter(c => c.key).filter((c, i) => data.map(c => c.key).indexOf(c.key) === i);

        const savedConfigurationIds = !data.length ? [] : await db.query.configuration.findMany({
            where: inArray(configuration.key, data.map(c => c.key)),
            columns: { key: true, },
        });

        const configurationInserts = data
            .filter(c => !savedConfigurationIds.map(c => c.key).includes(c.key));

        const configurationUpdates = data
            .filter(c => savedConfigurationIds.map(c => c.key).includes(c.key));

        if (configurationInserts.length) {
            await db.insert(configuration).values(configurationInserts);
        }

        if (configurationUpdates.length) {
            for (const c of configurationUpdates) {
                await db.update(configuration)
                    .set(c)
                    .where(eq(configuration.key, c.key));
            }
        }

        return true;
    } catch(e: any) {
        throw e;
    }
}