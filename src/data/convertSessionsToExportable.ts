import {formatExportableSession} from './getConvertedSession'

export function convertSessionsToExportable(_sessions: any[] = [], opts: any = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await Promise.all(_sessions.map((s: any) => formatExportableSession(s, opts)));
            resolve(data);
        } catch (e) { 
            reject(e);
        }
    });
}

