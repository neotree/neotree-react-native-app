import Constants from 'expo-constants';
import * as types from '../../types';
import { dbTransaction } from './db';

const APP_VERSION = Constants.manifest?.version;

export async function getAuthenticatedUser() {
    const rows = await dbTransaction('select * from authenticated_user;');
    const user = rows[0];
    return user?.details ? JSON.parse(user.details) : null;
}

export async function setLocation(params: { hospital?: string; country: string; }) {
	const location = { id: 1, ...params, };
	await dbTransaction(
		`insert or replace into location (${Object.keys(location).join(',')}) values (${Object.keys(location).map(() => '?').join(',')});`,
		Object.values(location),
	);
}

export async function getLocation() {
    const rows = await dbTransaction('select * from location limit 1;', null);
    return rows[0] as (null | types.Location);
} 

export const getApplication = () => new Promise<types.Application>((resolve, reject) => {
    (async () => {
        try {
            const getApplicationRslt = await dbTransaction('select * from application where id=1;');
            const application = getApplicationRslt[0];
            if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
            resolve(application);
        } catch (e) { reject(e); }
    })();
});

export const getConfigKeys = (options = {}) => new Promise<types.ConfigKey[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            let order = (_order || [['position', 'ASC']]);
            order = (order.map ? order : [])
                .map((keyVal: any) => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
                .filter((clause: any) => clause)
                .join(',');

            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');

            let q = 'select * from config_keys';
            q = where ? `${q} where ${where}` : q;
            q = order ? `${q} order by ${order}` : q;

            const rows = await dbTransaction(`${q};`.trim(), null);
            resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { reject(e); }
    })();
});

export const getConfiguration = (options = {}) => new Promise<types.Configuration>((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');
            let q = 'select * from configuration';
            q = where ? `${q} where ${where}` : q;

            const configurationRslts = await dbTransaction(`${q} limit 1;`.trim());
            const configuration = {
                data: {},
                ...configurationRslts.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]
            };
            const configKeys = await getConfigKeys();
            resolve({
                ...configuration,
                data: configKeys.reduce((acc, { data: { configKey } }) => ({
                ...acc,
                [configKey]: acc[configKey] ? true : false,
                }), configuration.data)
            });
        } catch (e) { reject(e); }
    })();
});

export const saveConfiguration = (data = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const res = await dbTransaction(
                'insert or replace into configuration (id, data, createdAt, updatedAt) values (?, ?, ?, ?);',
                [1, JSON.stringify(data || {}), new Date().toISOString(), new Date().toISOString()]
            );
            resolve(res);
        } catch (e) { reject(e); }
    })();
});

export const getScript = (options = {}) => new Promise<{
    script: types.Script;
    screens: types.Screen[];
    diagnoses: types.Diagnosis[];
}>((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');
            let q = 'select * from scripts';
            q = where ? `${q} where ${where}` : q;

            const res = await dbTransaction(`${q} limit 1;`.trim());
            const script = res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0];
            let screens = [];
            let diagnoses = [];

            if (script) {
                const _screens = await dbTransaction(`select * from screens where script_id='${script.script_id}' order by position asc;`);
                const _diagnoses = await dbTransaction(`select * from diagnoses where script_id='${script.script_id}' order by position asc;`);
                screens = _screens
                    .map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))
                    .map(s => ({
                        ...s,
                        data: {
                            ...s.data,
                            metadata: {
                                ...s.data?.metadata,
                                fields: s.data?.metadata?.fields || [],
                                items: s.data?.metadata?.items || [],
                            },
                        },
                    }));
                diagnoses = _diagnoses.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }));
            }

            resolve({ script, screens, diagnoses, });
        } catch (e) { reject(e); }
    })();
});

export const getScripts = (options = {}) => new Promise<types.Script[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            let order = (_order || [['position', 'ASC']]);
            order = (order.map ? order : [])
                .map((keyVal: any) => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
                .filter((clause: any) => clause)
                .join(',');

            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');

            let q = 'select * from scripts';
            q = where ? `${q} where ${where}` : q;
            q = order ? `${q} order by ${order}` : q;

            const rows = await dbTransaction(`${q};`.trim());
            resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { reject(e); }
    })();
});

export const getScreens = (options = {}) => new Promise<types.Screen[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            let order = (_order || [['position', 'ASC']]);
            order = (order.map ? order : [])
                .map((keyVal: any) => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
                .filter((clause: any) => clause)
                .join(',');

            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');

            let q = 'select * from screens';
            q = where ? `${q} where ${where}` : q;
            q = order ? `${q} order by ${order}` : q;

            const rows = await dbTransaction(`${q};`.trim(), null);
            resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { reject(e); }
    })();
});

export const getDiagnoses = (options = {}) => new Promise<types.Diagnosis[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            let order = (_order || [['position', 'ASC']]);
            order = (order.map ? order : [])
                .map((keyVal: any) => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
                .filter((clause: any) => clause)
                .join(',');

            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');

            let q = 'select * from diagnoses';
            q = where ? `${q} where ${where}` : q;
            q = order ? `${q} order by ${order}` : q;

            const rows = await dbTransaction(`${q};`.trim(), null);
            resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { reject(e); }
    })();
});

export const countSessions = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');
            let q = 'select count(id) from sessions';
            q = where ? `${q} where ${where}` : q;

            const res = await dbTransaction(`${q};`.trim());
            resolve(res ? res[0] : 0);
        } catch (e) { reject(e); }
    })();
});
  
export const getSession = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');
            let q = 'select * from sessions';
            q = where ? `${q} where ${where}` : q;

            const res = await dbTransaction(`${q} limit 1;`.trim());
            resolve(res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]);
        } catch (e) { reject(e); }
    })();
});
  
export const getSessions = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            let order = (_order || [['createdAt', 'DESC']]);
            order = (order.map ? order : [])
                .map((keyVal: any) => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
                .filter((clause: any) => clause)
                .join(',');

            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');

            let q = 'select * from sessions';
            q = where ? `${q} where ${where}` : q;
            q = order ? `${q} order by ${order}` : q;

            const rows = await dbTransaction(`${q};`.trim(), null);
            resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) { reject(e); }
    })();
});

export const deleteSessions = (ids: any[] = []) => new Promise((resolve, reject) => {
    (async () => {
        try {
            ids = ids || [];
            if (!ids.map) ids = [ids];

            const res = await dbTransaction(`delete from sessions where id in (${ids.join(',')})`);
            resolve(res);
        } catch (e) { reject(e); }
    })();
});

export const saveApplication = (params = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const getApplicationRslt = await dbTransaction('select * from application where id=1;');
            const _application = getApplicationRslt[0];

            let application = {
                ..._application,
                ...params,
                id: 1,
                version: APP_VERSION,
                updatedAt: new Date().toISOString(),
            };

            await dbTransaction(
                `insert or replace into application (${Object.keys(application).join(',')}) values (${Object.keys(application).map(() => '?').join(',')});`,
                Object.values(application)
            );
            application = await getApplication();
            resolve(application);
        } catch (e) { reject(e); }
    })();
});

export const getScriptsFields = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            const scripts = await getScripts();
            const rslts = await Promise.all(scripts.map(script => new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const screens = await getScreens({ script_id: script.script_id });
                        resolve({
                            [script.script_id]: screens.map(screen => {
                                const metadata = { ...screen.data.metadata };
                                const fields = metadata.fields || [];
                                return {
                                    screen_id: screen.screen_id,
                                    script_id: screen.script_id,
                                    screen_type: screen.type,
                                    keys: (() => {
                                        let keys = [];
                                        switch (screen.type) {
                                            case 'form':
                                                keys = fields.map((f: any) => f.key);
                                                break;
                                            default:
                                                keys.push(metadata.key);
                                        }
                                        return keys.filter((k: any) => k);
                                    })(),
                                };
                            })
                        });
                    } catch (e) { reject(e); }
                })();
            })));
            resolve(rslts.reduce((acc: any, s: any) => ({ ...acc, ...s }), {}));
        } catch (e) { reject(e); }
    })();
});
