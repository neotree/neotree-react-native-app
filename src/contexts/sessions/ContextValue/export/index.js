import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { exportSession } from '@/api/export';
import { updateSessions } from '@/api/sessions';
import getJSON from './getJSON';

export { getJSON };

const exportSuccessAlert = (msg = '') => {
  Alert.alert(
    '',
    msg,
    [
      {
        text: 'OK',
        onPress: () => {},
      }
    ],
    { cancelable: true }
  );
};

export function exportJSON() {
  const { sessions } = this.state;
  
  const scripts = sessions.reduce((acc, { data: { script } }) => ({
    ...acc,
    [script.id]: script,
  }), {});

  const saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      this.setState({ exporting: true });      
      
      const json = getJSON(sessions).reduce((acc, e) => ({
        ...acc,
        [e.script.id]: [...(acc[e.script.id] || []), e],
      }), {});

      const done = () => {
        this.setState({ exporting: false });
        exportSuccessAlert('File saved in NeoTree folder');
      };

      Promise.all(Object.keys(json).map(scriptId => {
        const scriptTitle = scripts[scriptId].data.title;
        const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-${scriptTitle}.json`;
        return new Promise((resolve) => {
          (async () => {
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ sessions: json[scriptId] }, null, 4), { encoding: FileSystem.EncodingType.UTF8 });
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync('NeoTree', asset, false);
            resolve();
          })();
        });
      })).then(done).catch(done);      
    }
  };

  saveFile();
}

export function exportEXCEL() {
  const { sessions } = this.state;
  
  const scripts = sessions.reduce((acc, { data: { script } }) => ({
    ...acc,
    [script.id]: script,
  }), {});
  
  const json = getJSON(sessions).reduce((acc, e) => ({
    ...acc,
    [e.scrip.id]: [...(acc[e.script.id] || []), e],
  }), {});

  const sheets = Object.keys(json).map(scriptId => {
    const scriptTitle = scripts[scriptId].data.title;
    const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-${scriptTitle}.xlsx`;

    const data = json[scriptId].map(e => e.entries.reduce((acc, e) => ({
      ...acc,
      [e.key || 'N/A']: e.values.map(v => v.value || 'N/A').join(', ')
    }), null)).filter(e => e);

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, scriptTitle);

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    return [fileUri, wbout];
  });

  if (sheets.length) {
    this.setState({ exporting: true });

    sheets.map(([fileUri, wbout]) => {
      const saveFile = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status === 'granted') {
          await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync('NeoTree', asset, false);
          this.setState({ exporting: false });
          exportSuccessAlert('File saved in NeoTree folder');
        }
      };
    
      saveFile();
    });
  }

  // writeFile(file, wbout, 'ascii').then(console.log).catch(console.log);
}

export function exportToApi() {
  const sessions = this.state.sessions.filter(s => !s.exported);
  const postData = getJSON(sessions);

  this.setState({ exporting: true });

  Promise.all(postData.map((s, i) => new Promise((resolve, reject) => {
    exportSession(s)
      .then(rslt => {
        const id = sessions[i].id;
        updateSessions({ exported: true }, { where: { id, }, })
          .then(() => this.setState(({ sessions }) => ({
            sessions: sessions.map(s => ({ ...s, exported: s.id === id ? true : s.exported }))
          })));
        resolve(rslt);
      })
      .catch(e => {
        reject(e);
      });
  })))
    .then(() => {
      this.setState({ exporting: false });
      exportSuccessAlert('Export complete');
    })
    .catch(() => {
      this.setState({ exporting: false });
      exportSuccessAlert('Export complete');
    });
}
