import { eq, inArray } from "drizzle-orm";

import { Session } from "@/types";
import { db } from "../db";
import { sessions } from '../schema';

export async function deleteAllSessions() {
    try {
        await db.delete(sessions);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function deleteSessions(sessionsIds: string[]) {
    try {
        if (sessionsIds.length) await db.delete(sessions).where(inArray(sessions.sessionId, sessionsIds));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function updateSessions(data: ({ sessionId: string; data: Partial<Session>; })[]) {
    try {
        for (const { sessionId, data: s, } of data) {
            await db.update(sessions)
                .set({
                    ...s,
                    data: s.data === undefined ? undefined : JSON.stringify({ ...s.data, }),
                })
                .where(eq(sessions.sessionId, sessionId));
        }
    } catch(e: any) {
        throw e;
    }
} 

export async function saveSessions(data: Session[]) {
    try {
        const savedSessionsIds = !data.length ? [] : await db.query.sessions.findMany({
            where: inArray(sessions.sessionId, data.map(s => s.sessionId)),
            columns: { sessionId: true, },
        });

        const sessionsInserts = data
            .filter(s => !savedSessionsIds.map(s => s.sessionId).includes(s.sessionId));

        const sessionsUpdates = data
            .filter(s => savedSessionsIds.map(s => s.sessionId).includes(s.sessionId));

        if (sessionsInserts.length) {
            await db.insert(sessions).values(sessionsInserts.map(s => {
                return {
                    ...s,
                    data: JSON.stringify({ ...s.data, }),
                };
            }));
        }

        if (sessionsUpdates.length) await updateSessions(sessionsUpdates.map(s => ({ sessionId: s.sessionId, data: s, })));

        return true;
    } catch(e: any) {
        throw e;
    }
}