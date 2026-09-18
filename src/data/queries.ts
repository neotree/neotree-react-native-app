import { APP_VERSION } from '@/src/constants';
import * as types from '../types';
import { dbTransaction } from './db';
import { buildOrder, buildWhere, withParsedData } from './queryBuilders';

export async function getAuthenticatedUser() {
    const rows = await dbTransaction('select * from authenticated_user;');
    const user = rows[0];
    return user?.details ? JSON.parse(user.details) : null;
}

let _locationCache: { value: null | types.Location; expires: number } | null = null;
const LOCATION_CACHE_TTL = 5000;

export function invalidateLocationCache() {
    _locationCache = null;
}

export async function getLocation() {
    if (_locationCache && Date.now() < _locationCache.expires) {
        return _locationCache.value;
    }
    const rows = await dbTransaction('select * from location limit 1;', null);
    const value = (rows[0] as (null | types.Location)) ?? null;
    _locationCache = { value, expires: Date.now() + LOCATION_CACHE_TTL };
    return value;
}

export const getApplication = () => new Promise<types.Application>((resolve, reject) => {
    (async () => {
        try {
            const getApplicationRslt = await dbTransaction('select * from application where id=1;');
            const application = getApplicationRslt[0];
            if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
            resolve(application);
        } catch (e) {
             reject(e); }
    })();
});

export const getExceptions = () => new Promise<types.Exception[]>((resolve, reject) => {
    (async () => {
        try {
            // Pending for either destination: the nodeapi and the webeditor are
            // drained independently, so a row already sent to one is still
            // returned until the other has it too. `is null` covers rows that
            // predate the editor_exported column.
            const results = await dbTransaction(
                'select * from exceptions where exported != ? or editor_exported != ? or editor_exported is null;',
                [true, true],
            );
            resolve(results);
        } catch (e) {
             reject(e); }
    })();
});


export const getConfigKeys = (options = {}) => new Promise<types.ConfigKey[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from config_keys${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            reject(e); }
    })();
});

export const getAliasFromKeyAndScriptId = (options:{
    script:string,
    name: string

} ) => new Promise<types.Alias>((resolve, reject) => {
    (async () => {
        try {
            // Script ids and field keys come from synced script content, so they
            // are bound rather than inlined: an apostrophe in either one would
            // otherwise break the statement.
            const rows = await dbTransaction(
                `select alias from nt_aliases
                 where (scriptid=? or old_script=?) and name=? limit 1;`,
                [options.script, options.script, options.name]
            );
            resolve(rows?.[0]);
        } catch (e) { 
            reject(e); }
    })();
});

export const getAliasKeyFromAliasAndScript= (options:{
    script:string,
    alias: string

} ) => new Promise<types.Alias>((resolve, reject) => {
    (async () => {
        try {
            const rows = await dbTransaction(
                `select name from nt_aliases
                 where (scriptid=? or old_script=?) and alias=? limit 1;`,
                [options.script, options.script, options.alias]
            );
            resolve(rows?.[0]);
        } catch (e) { 
            reject(e); }
    })();
});

export const getDrugsLibrary = (options = {}) => new Promise<{ data: types.DrugsLibraryItem; }[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from drugs_library${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            reject(e); }
    })();
});

export const getConfiguration = (options = {}) => new Promise<types.Configuration>((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = buildWhere(_where);
            const q = `select * from configuration${where.sql}`;

            const configurationRslts = await dbTransaction(`${q} limit 1;`, where.params);
            const configuration = {
                data: {},
                ...withParsedData(configurationRslts)[0]
            };
            const configKeys = await getConfigKeys();
            resolve({
                ...configuration,
                data: configKeys.reduce((acc, { data: { configKey } }) => ({
                ...acc,
                [configKey]: acc[configKey] ? true : false,
                }), configuration.data)
            });
        } catch (e) {
             reject(e); }
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
        } catch (e) { 
            reject(e); }
    })();
});

export const getScript = (options = {}) => new Promise<{
    script: types.Script;
    screens: types.Screen[];
    diagnoses: types.Diagnosis[];
    problems: types.Problem[];
}>((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = buildWhere(_where);
            const q = `select * from scripts${where.sql}`;

            const res = await dbTransaction(`${q} limit 1;`, where.params);
            const script = withParsedData(res)[0];
            let screens = [];
            let diagnoses = [];
            let problems = [];

            if (script) {
                const _screens = await dbTransaction('select * from screens where script_id=? order by position asc;', [script.script_id]);
                const _diagnoses = await dbTransaction('select * from diagnoses where script_id=? order by position asc;', [script.script_id]);
                const _problems = await dbTransaction('select * from problems where script_id=? order by position asc;', [script.script_id]);
                screens = withParsedData(_screens)
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
                diagnoses = withParsedData(_diagnoses);
                problems = withParsedData(_problems);

               
            }

            resolve({ script, screens, diagnoses, problems, });
        } catch (e) {

            reject(e);
        }
    })();
});

export const getScripts = (options = {}) => new Promise<types.Script[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from scripts${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            
            reject(e); }
    })();
});

export const getScreens = (options = {}) => new Promise<types.Screen[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from screens${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            
            reject(e); }
    })();
});

export const getDiagnoses = (options = {}) => new Promise<types.Diagnosis[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from diagnoses${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            
            reject(e); }
    })();
});

export const getProblems = (options = {}) => new Promise<types.Problem[]>((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['position', 'ASC']]);

            const where = buildWhere(_where);

            const q = `select * from problems${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            
            reject(e); }
    })();
});

export const countSessions = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = buildWhere(_where);
            const q = `select count(id) from sessions${where.sql}`;

            const res = await dbTransaction(`${q};`, where.params);
            resolve(res ? res[0] : 0);
        } catch (e) {
            
            reject(e); }
    })();
});
  
export const getSession = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { ..._where }: any = options || {};
            const where = buildWhere(_where);
            const q = `select * from sessions${where.sql}`;

            const res = await dbTransaction(`${q} limit 1;`, where.params);
            resolve(withParsedData(res)[0]);
        } catch (e) { 
            
            reject(e); }
    })();
});
  
export const getSessions = (options = {}) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const { _order, ..._where }: any = options || {};

            const order = buildOrder(_order, [['createdAt', 'DESC']]);

            const where = buildWhere(_where);

            const q = `select * from sessions${where.sql}${order}`;

            const rows = await dbTransaction(`${q};`, where.params);
            resolve(withParsedData(rows));
        } catch (e) { 
            
            reject(e); }
    })();
});

const SESSION_ID_BATCH_SIZE = 400;

function normalizeSessionIds(ids: any[] = []): number[] {
    return Array.from(new Set((ids || [])
        .map(id => Number(id))
        .filter(id => Number.isInteger(id) && id > 0)));
}

function sessionIdBatches(ids: number[]): number[][] {
    const batches: number[][] = [];
    for (let offset = 0; offset < ids.length; offset += SESSION_ID_BATCH_SIZE) {
        batches.push(ids.slice(offset, offset + SESSION_ID_BATCH_SIZE));
    }
    return batches;
}

export async function getSessionsByIds(ids: any[] = []): Promise<any[]> {
    const normalized = normalizeSessionIds(ids);
    const rows: any[] = [];
    for (const batch of sessionIdBatches(normalized)) {
        const placeholders = batch.map(() => '?').join(',');
        rows.push(...await dbTransaction(
            `select * from sessions where id in (${placeholders});`,
            batch
        ));
    }
    return withParsedData(rows);
}

/**
 * Sessions recorded at one site. Matches `sessions_location_idx`, so the
 * ordering and the filter are both served by the index.
 */
const SESSIONS_FOR_LOCATION_WHERE = `where json_valid(data)
                 and json_extract(data, '$.country') = ?
                 and TRIM(json_extract(data, '$.hospital_id')) = ?`;

function locationParams(country: string, hospital: string): any[] {
    return [country, hospital.trim()];
}

export interface SessionsPage {
    rows: any[];
    hasMore: boolean;
}

/**
 * Every session for the site, in one read.
 *
 * Only for callers that genuinely act on the whole set - exporting or deleting
 * in bulk - since it parses the JSON of every row. Use
 * `getSessionsPageForLocation` to populate a list.
 */
export const getSessionsForLocation = (
    country: string,
    hospital: string,
) => new Promise<any[]>((resolve, reject) => {
    (async () => {
        try {
            if (!country || !hospital) {
                resolve([]);
                return;
            }
            const rows = await dbTransaction(
                `select * from sessions
                 ${SESSIONS_FOR_LOCATION_WHERE}
                 order by createdAt DESC;`,
                locationParams(country, hospital)
            );
            resolve(withParsedData(rows));
        } catch (e) {
            reject(e);
        }
    })();
});

/**
 * One page of the site's sessions, newest first. Reads one row more than
 * asked for to report whether another page exists, without a second query.
 */
export async function getSessionsPageForLocation(
    country: string,
    hospital: string,
    opts: { limit: number; offset?: number } = { limit: 20 },
): Promise<SessionsPage> {
    if (!country || !hospital) return { rows: [], hasMore: false };
    const limit = Math.max(1, opts.limit);
    const offset = Math.max(0, opts.offset || 0);
    const rows = await dbTransaction(
        `select * from sessions
         ${SESSIONS_FOR_LOCATION_WHERE}
         order by createdAt DESC
         limit ? offset ?;`,
        [...locationParams(country, hospital), limit + 1, offset]
    );
    return { rows: withParsedData(rows.slice(0, limit)), hasMore: rows.length > limit };
}

/** How many sessions the site has, for "showing x of y". */
export async function countSessionsForLocation(country: string, hospital: string): Promise<number> {
    if (!country || !hospital) return 0;
    const rows = await dbTransaction(
        `select count(id) as total from sessions ${SESSIONS_FOR_LOCATION_WHERE};`,
        locationParams(country, hospital)
    );
    return Number(rows?.[0]?.total || 0);
}

/**
 * Sessions at the site whose Neotree ID contains `uid`.
 *
 * Runs in the db rather than over the loaded page, so a paged list still
 * searches every session the device holds. Older rows kept the id only inside
 * `data`, hence the COALESCE.
 */
export async function searchSessionsByUIDForLocation(
    country: string,
    hospital: string,
    uid: string,
    limit = 50,
): Promise<any[]> {
    const term = `${uid || ''}`.trim();
    if (!country || !hospital || !term) return [];
    // LIKE wildcards in the term itself would widen the search unexpectedly.
    const escaped = term.toUpperCase().replace(/[%_\\]/g, '');
    const rows = await dbTransaction(
        `select * from sessions
         ${SESSIONS_FOR_LOCATION_WHERE}
         and upper(COALESCE(NULLIF(uid, ''), json_extract(data, '$.uid'))) like ?
         order by createdAt DESC
         limit ?;`,
        [...locationParams(country, hospital), `%${escaped}%`, Math.max(1, limit)]
    );
    return withParsedData(rows);
}

export async function deleteSessions(ids: any[] = []) {
    const normalized = normalizeSessionIds(ids);
    if (!normalized.length) return [];
    // IDs are normalized to positive integers above, so a single statement is
    // safe here and keeps a large range deletion atomic without bind limits.
    return dbTransaction(`delete from sessions where id in (${normalized.join(',')})`);
}

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
        } catch (e) { 
            
            reject(e); }
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
                    } catch (e) { 
                        
                        reject(e); }
                })();
            })));
            resolve(rslts.reduce((acc: any, s: any) => ({ ...acc, ...s }), {}));
        } catch (e) { 
            
            reject(e); }
    })();
});
