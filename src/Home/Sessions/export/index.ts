import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from '../../../data';
import moment from 'moment';
import getJSON from './getJSON';
import { ASYNC_STORAGE_KEYS } from '../../../constants/async-storage';

export { getJSON };
export interface ManualExportOutcome {
  status: 'success' | 'already-exported' | 'local-only' | 'partial' | 'failed';
  localConfigured: boolean;
  localOk: number;
  remoteOk: number;
  localPending: number;
  remotePending: number;
  alreadyExported: number;
}

const getDate = () => moment(new Date()).format('YYYYMMDDhmm');

const getExportQueue = async (): Promise<number[]> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.EXPORT_QUEUE);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
};

const setExportQueue = async (ids: number[]) => {
  const unique = Array.from(new Set((ids || []).filter((id) => Number.isFinite(id))));
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.EXPORT_QUEUE, JSON.stringify(unique));
};

const addToExportQueue = async (ids: number[]) => {
  const existing = await getExportQueue();
  await setExportQueue([...existing, ...(ids || [])]);
};

const removeFromExportQueue = async (ids: number[]) => {
  const removeSet = new Set((ids || []).filter((id) => Number.isFinite(id)));
  if (!removeSet.size) return;
  const existing = await getExportQueue();
  await setExportQueue(existing.filter((id) => !removeSet.has(id)));
};

const getExcelEntryValue = ({
  entry,
  entryKey,
  scriptId,
  sessionId,
}: {
  entry: any;
  entryKey: string;
  scriptId: string;
  sessionId?: number;
}) => {
  if (entryKey === 'repeatables') {
    return null;
  }

  const rawValue = entry?.values?.value;

  if (Array.isArray(rawValue)) {
    return rawValue
      .filter((value) => value !== null && value !== undefined && value !== '')
      .join(', ');
  }

  if (rawValue !== undefined && rawValue !== null) {
    return String(rawValue);
  }

  console.error('Excel export entry missing values.value', {
    scriptId,
    sessionId,
    entryKey,
    entry,
  });

  return 'N/A';
};

const isSavingToDevicePermitted = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const res = await MediaLibrary.requestPermissionsAsync();
      resolve(res.granted);
    } catch (e) { return reject(e); }
  })();
});

export function exportJSON(_opts: any = {}) {
  const { sessions: suppliedSessions, ...opts } = _opts;
  const sessions = (suppliedSessions || []).filter(api.isExportableSession);

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const permissionGranted = await isSavingToDevicePermitted();
        if (!permissionGranted) return reject(new Error('App has not been granted permission to save files to device'));
        const scripts = sessions.reduce((acc: any, { data: { script } }: any) => ({
          ...acc,
          [script.script_id]: script,
        }), {});

        const parsedSessions: any = await api.convertSessionsToExportable(sessions, opts);
        const json = parsedSessions.reduce((acc: any, e: any) => ({
          ...acc,
          [e.script.id]: [...(acc[e.script.id] || []), e],
        }), {});

        const { granted, directoryUri }: any = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (granted) {
          await Promise.all(Object.keys(json).map(scriptId => {
            const scriptTitle = scripts[scriptId].data.title;
            return new Promise((resolve) => {
              (async () => {
                try {
                  const fileName = `${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, '_')}.json`;
                  const uri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, 'application/json');
                  await FileSystem.writeAsStringAsync(uri, JSON.stringify({ sessions: json[scriptId] }, null, 4), { encoding: FileSystem.EncodingType.UTF8 });
                  resolve(null);
                } catch(e) { reject(e); }
              })();
            });
          }));
        }
        
        resolve(null);
      } catch (e) { return reject(e); }
    })();
  });
}

export function exportEXCEL(opts: any = {}) {
  const sessions = (opts.sessions || []).filter(api.isExportableSession);
  const scriptsFields = { ...opts.scriptsFields };

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const permissionGranted = await isSavingToDevicePermitted();
        if (!permissionGranted) {
          const error = new Error('App has not been granted permission to save files to device');
          console.error('Excel export permission denied', {
            sessionCount: sessions.length,
            format: opts.format,
          });
          return reject(error);
        }

        const { granted, directoryUri }: any = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!granted) {
          console.error('Excel export directory permission not granted', {
            sessionCount: sessions.length,
            format: opts.format,
          });
        }

        if (granted) {
          const scripts = sessions.reduce((acc: any, { data: { script } }: any) => ({
            ...acc,
            [script.script_id]: script,
          }), {});
    
          const parsedSessions: any = await api.convertSessionsToExportable(sessions, opts);
          const json = parsedSessions.reduce((acc: any, e: any) => ({
            ...acc,
            [e.script.id]: [...(acc[e.script.id] || []), e],
          }), {});

          const sheets = await Promise.all(Object.keys(json).map(scriptId => new Promise((resolve, reject) => {
            (async () => {
              try {
                const scriptTitle = scripts[scriptId].data.title;
                const fileName = `${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, '_')}.xlsx`;
                const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
                const keys = !scriptsFields[scriptId] ? [] : scriptsFields[scriptId].reduce((acc: any, { keys }: any) => [...acc, ...keys], []);
        
                const data = json[scriptId].map((e: any) => {
                  const values = Object.keys(e.entries).reduce((acc: any, entryKey) => {
                    const entry = e.entries[entryKey];
                    const entryValue = getExcelEntryValue({
                      entry,
                      entryKey,
                      scriptId,
                      sessionId: e.id,
                    });

                    if (entryValue === null) {
                      return acc;
                    }

                    return {
                      ...acc,
                      [entryKey || 'N/A']: entryValue
                    };
                  }, null);
                  return !values ? null : keys.reduce((acc: any, key: any) => ({ ...acc, [key]: values[key] || 'N/A' }), {});
                }).filter((e: any) => e);
        
                const ws = XLSX.utils.json_to_sheet(data);
        
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, scriptTitle.substring(0, 31));
        
                const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        
                resolve([fileUri, wbout]);
              } catch (e) {
                console.error('Excel export sheet generation failed', {
                  scriptId,
                  scriptTitle: scripts[scriptId]?.data?.title,
                  sessionCount: json[scriptId]?.length || 0,
                  error: e,
                });
                reject(e);
              }
            })();
          })));
    
          if (sheets.length) {
            await Promise.all(sheets.map(([fileUri, wbout]: any) => new Promise((resolve, reject) => {
              (async () => {
                try {
                  await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
                  resolve(null);
                } catch (e) {
                  console.error('Excel export file write failed', {
                    fileUri,
                    error: e,
                  });
                  reject(e);
                }
              })();
            })));
          }
        }

        resolve(null);
      } catch (e) {
        console.error('Excel export failed', {
          sessionCount: sessions.length,
          format: opts.format,
          error: e,
        });
        reject(e);
      }
    })();
  });
}

export function exportToApi(opts: any = {}) {
  const _sessions = (opts.sessions || []).filter(api.isExportableSession);

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const queuedIds = await getExportQueue();
        let queuedSessions: any[] = [];
        if (queuedIds.length) {
          const allSessions: any[] = (await api.getSessions()) as any[];
          queuedSessions = (allSessions || []).filter(s => queuedIds.includes(s.id));
          const existingIds = queuedSessions.map(s => s.id);
          const missingIds = queuedIds.filter(id => !existingIds.includes(id));
          if (missingIds.length) {
            await removeFromExportQueue(missingIds);
          }

          const nonExportableIds = queuedSessions
            .filter(s => !api.isExportableSession(s))
            .map(s => s.id);
          if (nonExportableIds.length) {
            await removeFromExportQueue(nonExportableIds);
            queuedSessions = queuedSessions.filter(api.isExportableSession);
          }

          const alreadyExportedIds = queuedSessions.filter(s => Boolean(s.exported)).map(s => s.id);
          if (alreadyExportedIds.length) {
            await removeFromExportQueue(alreadyExportedIds);
            queuedSessions = queuedSessions.filter(s => !Boolean(s.exported));
          }
        }

        const hasLocalConfig = await api.hasLocalServerConfig();
        const location = await api.getLocation();

        const localRequired = (s: any) => api.localRequiredForSession(s, location, hasLocalConfig);

        const needsExport = (s: any) => api.isExportableSession(s) && (
          !s.exported ||
          (api.pollingRequired(s.data?.country) && !s.poll_exported) ||
          (localRequired(s) && !s.local_export)
        );

        const candidates = [
          ..._sessions,
          ...queuedSessions,
        ]
          .filter(needsExport)
          .reduce((acc: any[], s: any) => {
            if (!acc.some(e => e.id === s.id)) acc.push(s);
            return acc;
          }, []);

        try {
          if (opts.dontSaveFile !== true) await exportJSON(opts);
        } catch { /* Do nothing */ }

        let outcome: ManualExportOutcome = {
          status: 'success',
          localConfigured: hasLocalConfig,
          localOk: 0,
          remoteOk: 0,
          localPending: 0,
          remotePending: 0,
          alreadyExported: 0,
        };

        if (!candidates.length) {
          const selectedCount = Array.isArray(_sessions) ? _sessions.length : 0;
          if (selectedCount) {
            outcome = { ...outcome, status: 'already-exported', alreadyExported: selectedCount };
          }
          resolve(outcome);
          return;
        }

        try {
          const loc = await api.getLocation();
          if (loc?.country) {
            api.resetCircuit(api.backendKey(loc.country, 'local', loc.hospital));
          }
        } catch { /* a failed location read just means no local reset */ }

        await api.withExportLock(async () => {

        const freshRows: any[] = ((await api.getSessions()) as any[]) || [];
        const freshById: any = {};
        freshRows.forEach((s: any) => { if (s?.id !== undefined) freshById[s.id] = s; });

        const sessions = candidates
          .map((s: any) => !freshById[s?.id] ? s : {
            ...s,
            exported: freshById[s.id].exported,
            poll_exported: freshById[s.id].poll_exported,
            local_export: freshById[s.id].local_export,
          })
          .filter(needsExport);

        if (!sessions.length) return;

        const wasRemoteDone = new Set(
          sessions
            .filter((s: any) => {
              const pollSatisfied = !api.pollingRequired(s.data?.country) || Boolean(s.poll_exported);
              return Boolean(s.exported) && pollSatisfied;
            })
            .map((s: any) => s.id)
        );

        const wasLocalDone = new Set(
          sessions.filter((s: any) => !localRequired(s) || Boolean(s.local_export)).map((s: any) => s.id)
        );


        const result = await api.doExportSessions(sessions);

        const postRows: any[] = ((await api.getSessions()) as any[]) || [];
        const postById: any = {};
        postRows.forEach((s: any) => { if (s?.id !== undefined) postById[s.id] = s; });

        const isRemoteDone = (s: any) => {
          const row = postById[s.id] || s;
          const pollSatisfied = !api.pollingRequired(s.data?.country) || Boolean(row.poll_exported);
          return Boolean(row.exported) && pollSatisfied;
        };
        const isLocalDone = (s: any) => {

          if (!localRequired(s)) return true;
          return Boolean((postById[s.id] || s).local_export);
        };

        const remotePending = sessions.filter((s: any) => !isRemoteDone(s));
        const localPending = sessions.filter((s: any) => !isLocalDone(s));

        const sentRemote = sessions.filter((s: any) => isRemoteDone(s) && !wasRemoteDone.has(s.id));
        const sentLocal = sessions.filter((s: any) => isLocalDone(s) && !wasLocalDone.has(s.id));
        const alreadyDone = sessions.filter((s: any) => (
          wasRemoteDone.has(s.id) && wasLocalDone.has(s.id)
        ));

        const clearedIds = sessions
          .map((s: any) => s.id)
          .filter((id: any) => Boolean(postById[id]?.exported));
        if (clearedIds.length) await removeFromExportQueue(clearedIds);

        const stillPendingMainIds = sessions
          .map((s: any) => s.id)
          .filter((id: any) => !postById[id]?.exported);
        if (stillPendingMainIds.length) await addToExportQueue(stillPendingMainIds);

        outcome = {
          status: 'success',
          localConfigured: result.localConfigured,
          localOk: sentLocal.length,
          remoteOk: sentRemote.length,
          localPending: localPending.length,
          remotePending: remotePending.length,
          alreadyExported: alreadyDone.length,
        };

        if (remotePending.length || localPending.length) {
          console.log('Export outcome:', {
            sentRemote: sentRemote.length,
            sentLocal: sentLocal.length,
            alreadyExported: alreadyDone.length,
            remotePending: remotePending.length,
            localPending: localPending.length,
          });

          api.scheduleExportSessions();
        }

        if (!remotePending.length && !localPending.length) {
          outcome.status = (!sentRemote.length && !sentLocal.length && alreadyDone.length)
            ? 'already-exported'
            : 'success';
        } else if (sessions.some(localRequired) && !localPending.length && remotePending.length) {
          outcome.status = 'local-only';
        } else if (sentRemote.length || sentLocal.length) {
          outcome.status = 'partial';
        } else {
          outcome.status = 'failed';
        }

        if (outcome.status === 'failed') {
          throw new Error(
            `Could not export ${remotePending.length} session(s) — no server could be reached. `
            + `The data is saved on this device and will be sent automatically once a server is available.`
          );
        }

        });

        resolve(outcome);
      } catch (e) {
        console.log('Export error:', e);
        reject(e);
      }
    })();
  });
}

export default function exportData(opts: any = {}) {
  const { format } = opts;

  opts.sessions = (opts.sessions || []).filter(api.isExportableSession);

  switch (format) {
    case 'jsonapi':
      return exportToApi(opts);
    case 'excel':
      return exportEXCEL(opts);
    case 'json':
      return exportJSON(opts);
    default:
      return new Promise((_, reject) => reject(new Error('Unknown export format')));
  }
}
