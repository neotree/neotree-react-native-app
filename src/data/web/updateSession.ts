import { makeApiCall } from './makeApiCall';

export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
			const res = await makeApiCall('nodeapi', '/updateSession', {
                method: 'POST',
                body: JSON.stringify(data),
            });
			const json = await res.json();
            resolve(json);
        } catch (e) { reject(e); }
    })();
});
