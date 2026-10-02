import {formatExportableSession} from './getConvertedSession'
import { logError } from '@/src/utils/logError';

/**
 * Converts each session independently. A single session with malformed or
 * unexpected data (e.g. a form entry missing metadata) must not block every
 * other session in the same batch from exporting — so a per-session failure
 * here is logged and that session is dropped from the result, rather than
 * rejecting the whole batch. The dropped session simply stays unexported and
 * is retried (and re-logged) on the next export attempt.
 */
export function convertSessionsToExportable(_sessions: any[] = [], opts: any = {}) {
    return new Promise(async (resolve, reject) => {
        try {
    
            const settled = await Promise.allSettled(_sessions.map((s: any) => formatExportableSession(s, opts)));

            const data: any[] = [];
            settled.forEach((result, i) => {
                if (result.status === 'fulfilled') {
                    data.push(result.value);
                } else {
                    logError('convertSessionsToExportable', result.reason, { sessionId: _sessions[i]?.id });
                }
            });

            resolve(data);
        } catch (e) {
            reject(e);
        }
    });
}

