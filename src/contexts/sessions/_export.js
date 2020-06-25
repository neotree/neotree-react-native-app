import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

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

const exportJSON = ({ setState }) => {
  const saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      setState({ exporting: true });
      const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-text.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify({ sessions: [] }), { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      setState({ exporting: false });
      exportSuccessAlert('File saved in Downloads folder');
    }
  };

  saveFile();
};

const exportEXCEL = ({ setState }) => {
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
      setState({ exporting: true });
      const fileUri = `${FileSystem.documentDirectory}${new Date().getTime()}-text.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      setState({ exporting: false });
      exportSuccessAlert('File saved in Downloads folder');
    }
  };

  saveFile();

  // writeFile(file, wbout, 'ascii').then(console.log).catch(console.log);
};

const exportToApi = ({ setState }) => {
  setState({ exporting: true });
  setTimeout(() => {
    setState({ exporting: false });
    exportSuccessAlert('Export success');
  }, 2000);
};

export default (params = {}) => ({
  exportJSON: () => exportJSON(params),
  exportEXCEL: () => exportEXCEL(params),
  exportToApi: () => exportToApi(params),
});
