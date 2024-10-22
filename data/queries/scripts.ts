import { and, asc, inArray } from 'drizzle-orm';

import { db } from "../db";
import { scripts } from "../schema";
import logger from '@/lib/logger';
import { 
    Script, 
    ScriptListItem, 
    GetScriptsOptions, 
    DataResponse 
} from '@/types';

/******************************************
 ************** LIST SCRIPTS **************
*******************************************/
export async function listScripts(options?: GetScriptsOptions): Promise<DataResponse<ScriptListItem[]>> {
    try {
        const {
            scriptsIds = [],
        } = { ...options };

        const where = and(
            !scriptsIds.length ? undefined : inArray(scripts.scriptId, scriptsIds),
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