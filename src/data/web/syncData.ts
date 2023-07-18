import Constants from 'expo-constants';
import { v4 as uuidv4 } from 'uuid';
//import queryString from 'query-string';
import { makeApiCall } from './makeApiCall';
import { getApplication, saveApplication, getAuthenticatedUser, _data_ } from './queries';

const APP_VERSION = Constants.expoConfig?.version;

export async function syncData(opts?: { force?: boolean; }) {  
	try {
		const authenticatedUser = await getAuthenticatedUser();

		let deviceId = localStorage.getItem('EXPO_CONSTANTS_INSTALLATION_ID'); // uuidv4();

		let last_sync_date = null;

		if (authenticatedUser) {
			const deviceReg = await makeApiCall('webeditor', `/get-device-registration?deviceId=${deviceId}`);
			const deviceRegJSON = await deviceReg.json();

			const app = await getApplication();

			last_sync_date = app?.last_sync_date;

			const shouldSync = true;
			// const shouldSync = opts?.force || 
			// 	(app?.mode === 'development') ||
			// 	!((app?.mode === 'production') && (deviceRegJSON?.info?.version === app?.webeditor_info?.version));

			if (shouldSync) {
				last_sync_date = new Date().toISOString();

				const res = await makeApiCall(
					'webeditor',
					`/sync-data?deviceId=${deviceId}`,
				);
				const json = await res.json();

				const webeditorInfo = json?.webeditorInfo || {};
				const device = json?.device || {};
				const configKeys = json?.configKeys || [];
				const scripts = json?.scripts || [];
				const screens = json?.screens || [];
				const diagnoses = json?.diagnoses || [];	
				
				_data_.webeditorInfo = webeditorInfo;
				_data_.device = device;
				_data_.configKeys = configKeys;
				_data_.scripts = scripts;
				_data_.screens = screens;
				_data_.diagnoses = diagnoses;
				
				const _application = await getApplication();

				let application = {
					id: 1,
					mode: _application?.mode || 'production',
					last_sync_date,
					uid_prefix: _application?.uid_prefix || device?.device_hash,
					total_sessions_recorded: Math.max(_application?.total_sessions_recorded || 0, device?.details?.scripts_count || 0),
					device_id: _application?.device_id || device?.device_id || deviceId,
					webeditor_info: JSON.stringify(webeditorInfo),
					createdAt: _application?.createdAt || new Date().toISOString(),            
					version: APP_VERSION,
					updatedAt: new Date().toISOString(),
				};

				await saveApplication(application);
			}
		}

		const _app = await getApplication();

		return { 
			authenticatedUser, 
			application: _app,
			last_sync_date,
		};
	} catch(e) { console.log(e); throw e; }
}  
