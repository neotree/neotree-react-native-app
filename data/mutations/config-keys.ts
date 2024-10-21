import { eq, inArray } from "drizzle-orm";

import { ConfigKey } from "@/types";
import { db } from "../db";
import { configKeys } from '../schema';

export async function deleteAllConfigKeys() {
    try {
        await db.delete(configKeys);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function deleteConfigKeys(configKeysIds: string[]) {
    try {
        if (configKeysIds.length) await db.delete(configKeys).where(inArray(configKeys.configKeyId, configKeysIds));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function saveConfigKeys(data: ConfigKey[]) {
    try {
        const savedConfigKeysIds = !data.length ? [] : await db.query.configKeys.findMany({
            where: inArray(configKeys.configKeyId, data.map(c => c.configKeyId)),
            columns: { configKeyId: true, },
        });

        const configKeysInserts = data
            .filter(c => !savedConfigKeysIds.map(c => c.configKeyId).includes(c.configKeyId));

        const configKeysUpdates = data
            .filter(c => savedConfigKeysIds.map(c => c.configKeyId).includes(c.configKeyId));

        if (configKeysInserts.length) {
            await db.insert(configKeys).values(configKeysInserts.map(c => {
                return {
                    ...c,
                    preferences: JSON.stringify({ ...c.preferences, }),
                    isDraft: c.isDraft ? 1 : 0,
                };
            }));
        }

        if (configKeysUpdates.length) {
            for (const c of configKeysUpdates) {
                await db.update(configKeys)
                    .set({
                        ...c,
                        isDraft: c.isDraft === undefined ? undefined : (c.isDraft ? 1 : 0),
                        preferences: c.preferences === undefined ? undefined : JSON.stringify({ ...c.preferences, })
                    })
                    .where(eq(configKeys.configKeyId, c.configKeyId));
            }
        }

        return true;
    } catch(e: any) {
        throw e;
    }
}