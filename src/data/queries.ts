import * as types from '../types';
import { dbTransaction } from './db';

export async function getAuthenticatedUser() {
    const rows = await dbTransaction('select * from authenticated_user;');
    const user = rows[0];
    return user?.details ? JSON.parse(user.details) : null;
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

export const getConfiguration = (options = {}) => new Promise((resolve, reject) => {
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

export const getScript = (options = {}) => new Promise<types.Script>((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
                .join(',');
            let q = 'select * from scripts';
            q = where ? `${q} where ${where}` : q;

            const res = await dbTransaction(`${q} limit 1;`.trim());
            resolve(res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]);
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
