import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as api from '@/api';
import moment from 'moment';
import getJSON from './getJSON';
import toNewJsonFormat from './toNewJsonFormat';

export { getJSON };

const getDate = () => moment(new Date()).format('YYYYMMDDhmm');

const isSavingToDevicePermitted = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      resolve(status === 'granted');
    } catch (e) { return reject(e); }
  })();
});

export function exportJSON(opts = {}) {
  const sessions = opts.sessions || [];

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const permissionGranted = await isSavingToDevicePermitted();
        if (!permissionGranted) return reject(new Error('App has not been granted permission to save files to device'));
      } catch (e) { return reject(e); }

      const scripts = sessions.reduce((acc, { data: { script } }) => ({
        ...acc,
        [script.script_id]: script,
      }), {});

      const json = getJSON({ ...opts, sessions }).reduce((acc, e) => ({
        ...acc,
        [e.script.id]: [...(acc[e.script.id] || []), e],
      }), {});
      
      const directory = FileSystem.documentDirectory;

      try {
        await Promise.all(Object.keys(json).map(scriptId => {
          const scriptTitle = scripts[scriptId].data.title;
          const fileUri = `${directory}${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, '_')}.json`;
          return new Promise((resolve) => {
            (async () => {
              try {
                const formatedJson = json[scriptId].map(f => {
                  return toNewJsonFormat(f);
                });
                await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ sessions: formatedJson }, null, 4), { encoding: FileSystem.EncodingType.UTF8 });
              } catch (e) { return reject(e); }

              let asset = null;
              try {
                asset = await MediaLibrary.createAssetAsync(fileUri);
              } catch (e) { return reject(e); }

              try {
                await MediaLibrary.createAlbumAsync('NeoTree', asset, false);
              } catch (e) { return reject(e); }

              resolve();
            })();
          });
        }));
      } catch (e) { reject(e); }

      resolve({ directory });
    })();
  });
}

export function exportEXCEL(opts = {}) {
  const sessions = opts.sessions || [];
  const scriptsFields = { ...opts.scriptsFields };

  return new Promise((resolve, reject) => {
    (async () => {
      const scripts = sessions.reduce((acc, { data: { script } }) => ({
        ...acc,
        [script.script_id]: script,
      }), {});

      const json = getJSON({ ...opts, ...sessions }).reduce((acc, e) => ({
        ...acc,
        [e.script.id]: [...(acc[e.script.id] || []), e],
      }), {});

      const directory = FileSystem.documentDirectory;

      const sheets = Object.keys(json).map(scriptId => {
        const scriptTitle = scripts[scriptId].data.title;
        const fileUri = `${directory}${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, '_')}.xlsx`;

        const keys = !scriptsFields[scriptId] ? [] : scriptsFields[scriptId].reduce((acc, { keys }) => [...acc, ...keys], []);

        const data = json[scriptId].map(e => {
          const values = e.entries.reduce((acc, e) => ({
            ...acc,
            [e.key || 'N/A']: e.values.map(v => v.value || 'N/A').join(', ')
          }), null);
          return !values ? null : keys.reduce((acc, key) => ({ ...acc, [key]: values[key] || 'N/A' }), {});
        }).filter(e => e);

        const ws = XLSX.utils.json_to_sheet(data);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, scriptTitle);

        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        return [fileUri, wbout];
      });

      if (sheets.length) {
        try {
          const permissionGranted = await isSavingToDevicePermitted();
          if (!permissionGranted) return reject(new Error('App has not been granted permission to save files to device'));
        } catch (e) { return reject(e); }

        try {
          await Promise.all(sheets.map(([fileUri, wbout]) => new Promise((resolve, reject) => {
            (async () => {
              try {
                await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
              } catch (e) { return reject(e); }

              let asset = null;
              try {
                asset = await MediaLibrary.createAssetAsync(fileUri);
              } catch (e) { return reject(e); }

              try {
                await MediaLibrary.createAlbumAsync('NeoTree', asset, false);
              } catch (e) { return reject(e); }

              resolve();
            })();
          })));
        } catch (e) { reject(e); }

        resolve({ directory });
      }
    })();
  });
}

export function exportToApi(opts = {}) {
  const _sessions = opts.sessions || [];

  return new Promise((resolve, reject) => {
    (async () => {
      const sessions = _sessions.filter(s => !s.exported);
      const postData = getJSON({ ...opts, sessions });

      if (postData.length) {
        try { await exportJSON(sessions); } catch (e) { /* Do nothing */ }

        try {
          await Promise.all(postData.map((s, i) => new Promise((resolve, reject) => {
            (async () => {
              try { 
                const formatted = await toNewJsonFormat(s);
                await api.exportSession(formatted); 
              } catch (e) { return reject(e); }

              const id = sessions[i].id;

              try { await api.updateSessions({ exported: true }, { where: { id, }, }); } catch (e) { return reject(e); }

              resolve();
            })();
          })));
        } catch (e) { reject(e); }
      }

      resolve();
    })();
  });
}

export default function exportData(opts = {}) {
  const { format } = opts;

  switch (format) {
    case 'jsonapi':
      return exportToApi(opts);
    case 'excel':
      return exportEXCEL(opts);
    case 'json':
      return exportJSON(opts);
    default:
      return new Promise((resolve, reject) => reject(new Error('Unknown export format')));
  }
}