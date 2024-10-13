import logger from '@/lib/logger';
import { Script } from '@/types';

import { dbTransaction } from "./db";

/*****************************************************
* GET_SCRIPTS
*************************************************** */
export async function getScripts() {
   let scripts: Script[] = [];
   let errors: string[] = [];

   try {
       const res = await dbTransaction('select * from scripts order by position desc;');
       scripts = res.map(s => JSON.parse(s.data)) as Script[];
   } catch(e: any) {
       logger.error('getScripts ERROR', e.message);
       errors.push(e.message);
   } finally {
       return {
           data: scripts,
           errors: errors.length ? errors : undefined,
       };
   }
}