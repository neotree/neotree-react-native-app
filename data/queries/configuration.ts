import { db } from "../db";
import logger from '@/lib/logger';
import { DataResponse } from '@/types';

/******************************************
 ************ GET CONFIGURATION ***********
*******************************************/
export async function getConfiguration(): Promise<DataResponse<{ [key: string]: boolean; }>> {
    try {
        const res = await db.query.configuration.findMany();

        const data = res.reduce((acc, c) => ({
            ...acc,
            [c.key]: !!c.selected,
        }), {} as { [key: string]: boolean; });

        return { data, };
    } catch(e: any) {
        logger.log('getConfiguration ERROR', e.message);
        return { data: {}, errors: [e.message], };
    }
}