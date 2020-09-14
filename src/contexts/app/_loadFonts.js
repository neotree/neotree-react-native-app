import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function loadFonts() {
  return new Promise((resolve, reject) => {
    this.setState({ loadingFonts: true });

    const done = (e, res) => {
      this.setState({ fontsLoaded: true });
      if (e) { 
        reject(e);
      } else {
        resolve(res);
      }
    };

    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    })
      .then(res => done(null, res))
      .catch(done);
  });
}
