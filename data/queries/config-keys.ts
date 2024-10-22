import { and, asc, inArray } from 'drizzle-orm';

import { db } from "../db";
import { configKeys } from "../schema";
import logger from '@/lib/logger';
import { 
    ConfigKeyListItem, 
    GetConfigKeysOptions, 
    DataResponse 
} from '@/types';

/******************************************
 ************** LIST SCRIPTS **************
*******************************************/
export async function listConfigKeys(options?: GetConfigKeysOptions): Promise<DataResponse<ConfigKeyListItem[]>> {
    try {
        const {
            configKeysIds = [],
        } = { ...options };

        const where = and(
            !configKeysIds.length ? undefined : inArray(configKeys.configKeyId, configKeysIds),
        );

        const res = await db.query.configKeys.findMany({
            where,
            columns: {
                key: true,
                label: true,
                isDraft: true,
                oldConfigKeyId: true,
                configKeyId: true,
            },
            orderBy: asc(configKeys.position),
        });

        const data = res.map(({ oldConfigKeyId, configKeyId, ...s }) => ({
            ...s,
            isDraft: !!s.isDraft,
            configKeyId: oldConfigKeyId || configKeyId,
        }));

        return { data, };
    } catch(e: any) {
        logger.log('listConfigKeys ERROR', e.message);
        return { data: [], errors: [e.message], };
    }
}