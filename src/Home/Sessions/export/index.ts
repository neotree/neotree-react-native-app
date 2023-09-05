import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as api from '../../../data';
import moment from 'moment';
import getJSON from './getJSON';

export { getJSON };

const getDate = () => moment(new Date()).format('YYYYMMDDhmm');

const isSavingToDevicePermitted = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const res = await MediaLibrary.requestPermissionsAsync();
      resolve(res.granted);
    } catch (e) { return reject(e); }
  })();
});

export function exportJSON(_opts: any = {}) {
  const { sessions, ...opts } = _opts;

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
  const sessions = opts.sessions || [];
  const scriptsFields = { ...opts.scriptsFields };

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const permissionGranted = await isSavingToDevicePermitted();
        if (!permissionGranted) return reject(new Error('App has not been granted permission to save files to device'));

        const { granted, directoryUri }: any = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

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
                    return {
                      ...acc,
                      [entryKey || 'N/A']: entry.values.value.join(', ')
                    };
                  }, null);
                  return !values ? null : keys.reduce((acc: any, key: any) => ({ ...acc, [key]: values[key] || 'N/A' }), {});
                }).filter((e: any) => e);
        
                const ws = XLSX.utils.json_to_sheet(data);
        
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, scriptTitle.substring(0, 31));
        
                const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        
                resolve([fileUri, wbout]);
              } catch (e) { reject(e); }
            })();
          })));
    
          if (sheets.length) {
            await Promise.all(sheets.map(([fileUri, wbout]: any) => new Promise((resolve, reject) => {
              (async () => {
                try {
                  await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
                  resolve(null);
                } catch (e) { reject(e); }
              })();
            })));
          }
        }

        resolve(null);
      } catch (e) { reject(e); }
    })();
  });
}

export function exportToApi(opts: any = {}) {
  const _sessions = opts.sessions || [];

  return new Promise((resolve, reject) => {
    (async () => {
      const sessions = _sessions.filter((s: any) => !s.exported);
      const postData: any = await api.convertSessionsToExportable(sessions, opts);

      try { await exportJSON(opts); } catch (e) { /* Do nothing */ }

      api.exportSessions().then(console.log).catch(console.log);

      if (postData.length) {
        try {
          await Promise.all(postData.map((s: any, i: number) => new Promise((resolve, reject) => {
            (async () => {
              try {
                await api.exportSession(s);    
				await api.updateSession({ exported: true }, { where: { id: sessions[i]?.id, }, });           
              } catch (e) { return reject(e); }
              resolve(null);
            })();
          })));
        } catch (e) { reject(e); }
      }

      resolve(null);
    })();
  });
}

export default function exportData(opts: any = {}) {
  const { format } = opts;

  opts.sessions = (opts.sessions || []).filter((s: any) => s.data.completed_at || s.data.canceled_at);

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
