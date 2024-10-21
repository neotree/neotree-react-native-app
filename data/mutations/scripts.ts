import { eq, inArray } from "drizzle-orm";

import { Script } from "@/types";
import { db } from "../db";
import { scripts } from '../schema';

export async function deleteAllScripts() {
    try {
        await db.delete(scripts);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function deleteScripts(scriptsIds: string[]) {
    try {
        if (scriptsIds.length) await db.delete(scripts).where(inArray(scripts.scriptId, scriptsIds));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function saveScripts(data: Script[]) {
    try {
        const savedScriptsIds = !data.length ? [] : await db.query.scripts.findMany({
            where: inArray(scripts.scriptId, data.map(s => s.scriptId)),
            columns: { scriptId: true, },
        });

        const scriptsInserts = data
            .filter(s => !savedScriptsIds.map(s => s.scriptId).includes(s.scriptId));

        const scriptsUpdates = data
            .filter(s => savedScriptsIds.map(s => s.scriptId).includes(s.scriptId));

        if (scriptsInserts.length) {
            await db.insert(scripts).values(scriptsInserts.map(s => {
                return {
                    ...s,
                    preferences: JSON.stringify({ ...s.preferences, }),
                    nuidSearchFields: JSON.stringify(s.nuidSearchFields || []),
                    isDraft: s.isDraft ? 1 : 0,
                    nuidSearchEnabled: s.nuidSearchEnabled ? 1 : 0,
                    exportable: s.exportable ? 1 : 0,
                };
            }));
        }

        if (scriptsUpdates.length) {
            for (const s of scriptsUpdates) {
                await db.update(scripts)
                    .set({
                        ...s,
                        preferences: s.preferences === undefined ? undefined : JSON.stringify({ ...s.preferences, }),
                        nuidSearchFields: s.nuidSearchFields === undefined ? undefined : JSON.stringify(s.nuidSearchFields || []),
                        isDraft: s.isDraft === undefined ? undefined : (s.isDraft ? 1 : 0),
                        nuidSearchEnabled: s.nuidSearchEnabled === undefined ? undefined : (s.nuidSearchEnabled ? 1 : 0),
                        exportable: s.exportable === undefined ? undefined : (s.exportable ? 1 : 0),
                    })
                    .where(eq(scripts.scriptId, s.scriptId));
            }
        }

        return true;
    } catch(e: any) {
        throw e;
    }
}