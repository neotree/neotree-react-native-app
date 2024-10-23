import { and, asc, eq, inArray, or } from 'drizzle-orm';

import { db } from "../db";
import { scripts } from "../schema";
import logger from '@/lib/logger';
import { 
    Script, 
    Screen,
    ScriptListItem, 
    GetScriptsOptions, 
    DataResponse, 
    FullScript,
    Preferences,
    ScriptField,
    ScriptItem
} from '@/types';

/******************************************
 ************** GET SCRIPT ****************
*******************************************/
export async function getScript(scriptId: string): Promise<DataResponse<null | FullScript>> {
    try {
        const { data: [script], errors, } = await getScripts({
            scriptsIds: [scriptId],
        });
        return { data: script || null, errors, };
    } catch(e: any) {
        return { data: null, errors: [e.message], };
    }
}

/******************************************
 ************** GET SCRIPTS ***************
*******************************************/
export async function getScripts(options?: GetScriptsOptions): Promise<DataResponse<FullScript[]>> {
    try {
        const {
            scriptsIds = [],
        } = { ...options };

        const where = and(
            !scriptsIds.length ? undefined : or(
                inArray(scripts.scriptId, scriptsIds),
                inArray(scripts.oldScriptId, scriptsIds)
            ),
        );

        const res = await db.query.scripts.findMany({
            where,
            with: {
                screens: true,
                diagnoses: true,
            },
            orderBy: asc(scripts.position),
        });

        const data = res.map(({ oldScriptId, scriptId, ...script }) => {
            scriptId = oldScriptId || scriptId;
            return {
                ...script,
                oldScriptId,
                scriptId,
                type: script.type as Script['type'],
                description: script.description || '',
                isDraft: !!script.isDraft,
                preferences: JSON.parse(script.preferences) as Preferences,
                nuidSearchFields: JSON.parse(script.nuidSearchFields) as ScriptField[],
                nuidSearchEnabled: !!script.nuidSearchEnabled,
                exportable: !!script.exportable,
                screens: script.screens.map(screen => ({
                    ...screen,
                    type: screen.type as Screen['type'],
                    scriptId,
                    isDraft: !!screen.isDraft,
                    exportable: !!screen.exportable,
                    printable: screen.printable === null ? null : !!screen.printable,
                    skippable: !!screen.skippable,
                    confidential: !!screen.confidential,
                    prePopulate: JSON.parse(screen.prePopulate),
                    items: JSON.parse(screen.items) as ScriptItem[],
                    fields: JSON.parse(screen.fields) as ScriptField[],
                    preferences: JSON.parse(screen.preferences) as Preferences,
                    image1: screen.image1 === null ? null : JSON.parse(screen.image1),
                    image2: screen.image2 === null ? null : JSON.parse(screen.image2),
                    image3: screen.image3 === null ? null : JSON.parse(screen.image3),
                })),
                diagnoses: script.diagnoses.map(diagnosis => ({
                    ...diagnosis,
                    scriptId,
                    isDraft: !!diagnosis.isDraft,
                    symptoms: JSON.parse(diagnosis.symptoms),
                    preferences: JSON.parse(diagnosis.preferences) as Preferences,
                    image1: diagnosis.image1 === null ? null : JSON.parse(diagnosis.image1),
                    image2: diagnosis.image2 === null ? null : JSON.parse(diagnosis.image2),
                    image3: diagnosis.image3 === null ? null : JSON.parse(diagnosis.image3),
                })),
            };
        });

        return { data, };
    } catch(e: any) {
        logger.log('getScripts ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}

/******************************************
 ************** LIST SCRIPTS **************
*******************************************/
export async function listScripts(options?: GetScriptsOptions): Promise<DataResponse<ScriptListItem[]>> {
    try {
        const {
            scriptsIds = [],
        } = { ...options };

        const where = and(
            !scriptsIds.length ? undefined : or(
                inArray(scripts.scriptId, scriptsIds),
                inArray(scripts.oldScriptId, scriptsIds)
            ),
        );

        const res = await db.query.scripts.findMany({
            where,
            columns: {
                title: true,
                type: true,
                description: true,
                isDraft: true,
                oldScriptId: true,
                scriptId: true,
            },
            orderBy: asc(scripts.position),
        });

        const data = res.map(({ oldScriptId, scriptId, ...s }) => ({
            ...s,
            type: s.type as Script['type'],
            description: s.description || '',
            isDraft: !!s.isDraft,
            scriptId: oldScriptId || scriptId,
        }));

        return { data, };
    } catch(e: any) {
        logger.log('listScripts ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}