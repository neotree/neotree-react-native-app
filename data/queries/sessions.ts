import { and, desc, eq, inArray, or } from 'drizzle-orm';

import { db } from "../db";
import { scripts, sessions } from "../schema";
import logger from '@/lib/logger';
import { 
    SessionListItem, 
    GetSessionsOptions, 
    DataResponse, 
    Script,
    FullSession
} from '@/types';
import { useAsyncStorage } from '@/hooks/use-async-storage';

/******************************************
 ************** LIST SESSIONS *************
*******************************************/
export async function listSessions(options?: GetSessionsOptions): Promise<DataResponse<SessionListItem[]>> {
    try {
        const { COUNTRY_ISO, HOSPITAL_ID } = await useAsyncStorage.getState().getAllItems();

        const {
            sessionsIds = [],
            countriesISOs = [COUNTRY_ISO],
            hospitalsIds = [HOSPITAL_ID],
        } = { ...options };

        const where = and(
            !sessionsIds.length ? undefined : inArray(sessions.sessionId, sessionsIds.map(s => s)),
            !hospitalsIds.length ? undefined : inArray(sessions.hospitalId, hospitalsIds.map(h => h)),
            !countriesISOs.length ? undefined : inArray(sessions.countryISO, countriesISOs.map(c => c)),
        );

        const res = await db
            .select({
                sessionId: sessions.sessionId,
                scriptId: sessions.scriptId,
                hospitalId: sessions.hospitalId,
                countryISO: sessions.countryISO,
                title: sessions.title,
                neotreeId: sessions.neotreeId,
                exportedAt: sessions.exportedAt,
                completedAt: sessions.completedAt,
                canceledAt: sessions.canceledAt,
                createdAt: sessions.createdAt,
                updatedAt: sessions.updatedAt,
                script: {
                    scriptId: scripts.scriptId,
                    oldScriptId: scripts.oldScriptId,
                    title: scripts.title,
                    type: scripts.type,
                },
            })
            .from(sessions)
            .leftJoin(scripts, or(
                eq(scripts.scriptId, sessions.scriptId),
                eq(scripts.oldScriptId, sessions.scriptId)
            ))
            .orderBy(desc(sessions.id))
            .where(where);

        const data = res.map(s => ({
            ...s,
            script: !s.script ? null : {
                ...s.script,
                type: s.script.type as Script['type'],
            },
        }))

        return { data, };
    } catch(e: any) {
        logger.log('listSessions ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

/******************************************
 ************** GET SESSION ***************
*******************************************/
export async function getSession(sessionId: string): Promise<DataResponse<null | FullSession>> {
    try {
        const { data: [session], errors, } = await getSessions({
            sessionsIds: [sessionId],
        });
        return { data: session || null, errors, };
    } catch(e: any) {
        return { data: null, errors: [e.message], };
    }
}

/******************************************
 ************** GET SESSIONS **************
*******************************************/
export async function getSessions(options?: GetSessionsOptions): Promise<DataResponse<FullSession[]>> {
    try {
        const { COUNTRY_ISO, HOSPITAL_ID } = await useAsyncStorage.getState().getAllItems();

        let {
            sessionsIds = [],
            countriesISOs,
            hospitalsIds,
        } = { ...options };

        if (countriesISOs === undefined) countriesISOs = [COUNTRY_ISO];
        if (hospitalsIds === undefined) hospitalsIds = [HOSPITAL_ID];

        const where = and(
            !sessionsIds.length ? undefined : inArray(sessions.sessionId, sessionsIds.map(s => s)),
            !hospitalsIds?.length ? undefined : inArray(sessions.hospitalId, hospitalsIds.map(h => h)),
            !countriesISOs?.length ? undefined : inArray(sessions.countryISO, countriesISOs.map(c => c)),
        );

        const res = await db
            .select({
                session: sessions,
                script: {
                    scriptId: scripts.scriptId,
                    oldScriptId: scripts.oldScriptId,
                    title: scripts.title,
                    type: scripts.type,
                },
            })
            .from(sessions)
            .leftJoin(scripts, or(
                eq(scripts.scriptId, sessions.scriptId),
                eq(scripts.oldScriptId, sessions.scriptId)
            ))
            .orderBy(desc(sessions.id))
            .where(where);

        const data = res.map(s => ({
            ...s.session,
            script: !s.script ? null : {
                ...s.script,
                type: s.script.type as Script['type'],
            },
        }))

        return { data, };
    } catch(e: any) {
        logger.log('getSessions ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}