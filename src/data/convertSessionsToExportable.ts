import {formatExportableSession} from './getConvertedSession'

export function convertSessionsToExportable(_sessions: any[] = [], opts: any = {}) {
    return new Promise((resolve, reject) => {
        (async () => {
            try {

            const data = _sessions.map(async (s: any) => {
                return await formatExportableSession(s,opts)
                });
                resolve(data);
            } catch (e) { 
                reject(e); }
        })();
    });
}
