import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { exportSession } from '@/api/export';

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
  const saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      this.setState({ exporting: true });
      const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-text.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ sessions: [] }), { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      this.setState({ exporting: false });
      exportSuccessAlert('File saved in Downloads folder');
    }
  };

  saveFile();
}

export function exportEXCEL() {
  const data = [
    { name: 'John', city: 'Seattle', },
    { name: 'Mike', city: 'Los Angeles', },
    { name: 'Zach', city: 'New York', }
  ];

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Prova');

  const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

  const saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      this.setState({ exporting: true });
      const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-text.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      this.setState({ exporting: false });
      exportSuccessAlert('File saved in Downloads folder');
    }
  };

  saveFile();

  // writeFile(file, wbout, 'ascii').then(console.log).catch(console.log);
}

export function exportToApi() {
  const sessions = this.state.sessions.filter(s => !s.exported)
    .map(s => {
      const { script, form } = s.data;

      return {
        script: { id: script.id, title: script.data.title },
        entries: form.reduce((acc, e) => {
          return [
            ...acc,
            ...e.values.map(({ key, dataType, value, label, }) => ({
              key,
              type: dataType,
              values: [{ value, label }],
            }))
          ];
        }, []),
      };
    });

  const postData = sessions.map(data => ({
    uid: `${this.uid_prefix}-0001`,
    scriptId: data.script.id,
    data,
  }));

  this.setState({ exporting: true });

  Promise.all(postData.filter((s, i) => i === 0).map(s => exportSession(s)))
    .then(rslts => {
      console.log('SUCCESS', rslts);
    })
    .catch(e => {
      console.log('ERROR', e);
    });

  setTimeout(() => {
    this.setState({ exporting: false });
    exportSuccessAlert('Export success');
  }, 2000);
}
