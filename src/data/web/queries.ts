import Constants from 'expo-constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import * as types from '../../types';
import { makeApiCall } from './makeApiCall';

const APP_VERSION = Constants.manifest?.version;

export const _data_: any = {};

export const db = {};
export const sockets = {};

export async function setLocation(params: { hospital?: string; country: string; }) {
	const location = { id: 1, ...params, };
	sessionStorage.setItem('location', JSON.stringify(location));
}

export async function getLocation() {
	let location = sessionStorage.getItem('location') || null;
	if (location) return JSON.parse(location);
    return location as (null | types.Location);
}

export async function getAuthenticatedUser() {
	try {
		// const firebaseUser = await firebase.auth().currentUser;
		// if (firebaseUser) {
		// 	sessionStorage.setItem('authenticatedUser', JSON.stringify({ id: 1, details: firebaseUser }));
		// } else {
		// 	sessionStorage.removeItem('authenticatedUser');
		// }

		const res = sessionStorage.getItem('authenticatedUser');
		let user = null;
		if (res) user = JSON.parse(res);

		return user?.details || null;
	} catch(e) {
		console.log('[ERR]: getAuthenticatedUser', e);
		throw e;
	}
}

export async function login(params: { email: string; password: string; }) {
	try {
		await firebase.auth().signOut();
		sessionStorage.removeItem('authenticatedUser');

		const user = await firebase.auth().signInWithEmailAndPassword(params.email, params.password);
		if (user) sessionStorage.setItem('authenticatedUser', JSON.stringify({ id: 1, details: user }));

		const authenticatedUser = await getAuthenticatedUser();
		return authenticatedUser;
	} catch (e) { 
		throw e;
	}
}

export async function logout() {
	try {
		await firebase.auth().signOut();
		sessionStorage.removeItem('authenticatedUser');
		return null;
	} catch(e) {
		throw e;
	}
}

export async function signIn() {
	try {

	} catch(e) {

	}
}

export async function getApplication() {
	try {
		const applicationRslt = sessionStorage.getItem('application');
		const application = applicationRslt ? JSON.parse(applicationRslt) : null;
        if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
		return application;
	} catch(e) {
		console.log('[ERR]: getApplication', e);
		throw e;
	}
}

export async function saveApplication(params: any = {}) {
	try {
		const getApplicationRslt = sessionStorage.getItem('application');
		let _application = null;
		if (getApplicationRslt) _application = JSON.parse(getApplicationRslt);

		let application = {
			..._application,
			...params,
			id: 1,
			version: APP_VERSION,
			updatedAt: new Date().toISOString(),
		};

		sessionStorage.setItem('application', JSON.stringify(application));
		return await getApplication();
	} catch(e) {
		throw e;
	}
}

export async function dbTransaction() {
	try {

	} catch(e) {

	}
}

export async function createTablesIfNotExist() {
	try {

	} catch(e) {

	}
}

export async function resetTables() {
	try {

	} catch(e) {

	}
}

export async function getConfigKeys() {
	const configKeys = _data_.configKeys || [];
	return configKeys;
}

export async function getConfiguration() {
	try {

	} catch(e) {

	}
}

export async function saveConfiguration(data = {}) {
	try {
		let deviceId = localStorage.getItem('EXPO_CONSTANTS_INSTALLATION_ID'); // uuidv4();
		const res = await makeApiCall('nodeapi', `/web-app/${deviceId}/saveConfiguration`, {
			method: 'POST',
			body: JSON.stringify(data),
		});
		console.log('saveConfiguration', res);
	} catch(e) {
		console.log('saveConfiguration ERR', e);
	}
}

export async function getScript(opts: any = {}) {
	const allScripts: any[] = _data_.scripts || [];
	const allScreens: any[] = _data_.screens || [];
	const allDiagnoses: any[] = _data_.diagnoses || [];

	const script = allScripts.filter(s => s.script_id === opts?.script_id)[0];
	let screens: any[] = [];
	let diagnoses: any[] = [];

	if (script) {
		screens = allScreens.filter(s => s.script_id === script.script_id);
		diagnoses = allDiagnoses.filter(s => s.script_id === script.script_id);
	}

	return { script, screens, diagnoses, };
}

export async function getScripts() {
	const scripts = _data_.scripts || [];
	return scripts;
}

export async function getScreens() {
	try {

	} catch(e) {

	}
}

export async function getDiagnoses() {
	try {

	} catch(e) {

	}
}

export async function countSessions() {
	try {

	} catch(e) {

	}
}

export async function getSession() {
	try {

	} catch(e) {

	}
}

export async function getSessions() {
	try {

	} catch(e) {

	}
}

export async function deleteSessions() {
	try {

	} catch(e) {

	}
}

export async function getScriptsFields() {
	try {

	} catch(e) {

	}
}

export async function convertSessionsToExportable() {
	try {

	} catch(e) {

	}
}

export async function exportSessions() {
	try {

	} catch(e) {

	}
}

export async function saveSession() {
	try {

	} catch(e) {

	}
}

export async function updateSession() {
	try {

	} catch(e) {

	}
}

export async function exportSession() {
	try {

	} catch(e) {

	}
}

export async function getExportedSessionsByUID() {
	try {

	} catch(e) {

	}
}

export async function getExportedSessions() {
	try {

	} catch(e) {

	}
}

export async function addSocketEventsListeners() {
	try {

	} catch(e) {

	}
}