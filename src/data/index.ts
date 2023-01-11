import { makeApiCall } from './api';

export * from './api';

export * from './db';

export * from './queries';

export * from './syncData';

export * from './convertSessionsToExportable';

export * from './exportSessions';

export * from './saveSession';

export * from './updateSession';

export * from './auth';

export const exportSession = async (s: any) => {
    return await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
        method: 'POST',
        body: JSON.stringify(s),
    });
};
