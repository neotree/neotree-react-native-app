import { eq, inArray } from "drizzle-orm";

import { Screen } from "@/types";
import { db } from "../db";
import { screens } from '../schema';

export async function deleteAllScreens() {
    try {
        await db.delete(screens);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function deleteScreens(screensIds: string[]) {
    try {
        if (screensIds.length) await db.delete(screens).where(inArray(screens.screenId, screensIds));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function saveScreens(data: Screen[]) {
    try {
        const savedScreensIds = !data.length ? [] : await db.query.screens.findMany({
            where: inArray(screens.screenId, data.map(s => s.screenId)),
            columns: { screenId: true, },
        });

        const screensInserts = data
            .filter(s => !savedScreensIds.map(s => s.screenId).includes(s.screenId));

        const screensUpdates = data
            .filter(s => savedScreensIds.map(s => s.screenId).includes(s.screenId));

        if (screensInserts.length) {
            await db.insert(screens).values(screensInserts.map(s => {
                return {
                    ...s,
                    isDraft: s.isDraft ? 1 : 0,
                    exportable: s.exportable ? 1 : 0,
                    printable: s.printable === undefined ? undefined : (s.printable ? 1 : 0),
                    skippable: s.skippable ? 1 : 0,
                    confidential: s.confidential ? 1 : 0,
                    prePopulate: JSON.stringify(s.prePopulate || []),
                    items: JSON.stringify(s.items || []),
                    fields: JSON.stringify(s.fields || []),
                    preferences: JSON.stringify({ ...s.preferences, }),
                    image1: s.image1 === undefined ? undefined : JSON.stringify({ ...s.image1, }),
                    image2: s.image2 === undefined ? undefined : JSON.stringify({ ...s.image2, }),
                    image3: s.image3 === undefined ? undefined : JSON.stringify({ ...s.image3, }),
                };
            }));
        }

        if (screensUpdates.length) {
            for (const s of screensUpdates) {
                await db.update(screens)
                    .set({
                        ...s,
                        isDraft: s.isDraft === undefined ? undefined : s.isDraft ? 1 : 0,
                        exportable: s.exportable === undefined ? undefined : s.exportable ? 1 : 0,
                        printable: s.printable === undefined ? undefined : (s.printable ? 1 : 0),
                        skippable: s.skippable === undefined ? undefined : s.skippable ? 1 : 0,
                        confidential: s.confidential === undefined ? undefined : s.confidential ? 1 : 0,
                        prePopulate: s.prePopulate === undefined ? undefined : JSON.stringify(s.prePopulate || []),
                        items: s.items === undefined ? undefined : JSON.stringify(s.items || []),
                        fields: s.fields === undefined ? undefined : JSON.stringify(s.fields || []),
                        preferences: s.preferences === undefined ? undefined : JSON.stringify({ ...s.preferences, }),
                        image1: s.image1 === undefined ? undefined : JSON.stringify({ ...s.image1, }),
                        image2: s.image2 === undefined ? undefined : JSON.stringify({ ...s.image2, }),
                        image3: s.image3 === undefined ? undefined : JSON.stringify({ ...s.image3, }),
                    })
                    .where(eq(screens.screenId, s.screenId));
            }
        }

        return true;
    } catch(e: any) {
        throw e;
    }
}