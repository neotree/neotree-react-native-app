import { makeApiCall } from './makeApiCall';

export const updateSession = (data: any = {}, opts: any = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
			let deviceId = localStorage.getItem('EXPO_CONSTANTS_INSTALLATION_ID');
			const res = await makeApiCall('nodeapi', `/web-app/${deviceId}/updateSession`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
			const json = await res.json();
            resolve(json);
        } catch (e) { reject(e); }
    })();
});
