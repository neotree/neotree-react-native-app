import {formatExportableSession} from './getConvertedSession'
import {getApplication} from './queries'

export function convertSessionsToExportable(_sessions: any[] = [], opts: any = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const application = opts.application || await getApplication();
            const data = await Promise.all(_sessions.map((s: any) => formatExportableSession(s, { ...opts, application })));
            resolve(data);
        } catch (e) { 
            reject(e);
        }
    });
}
