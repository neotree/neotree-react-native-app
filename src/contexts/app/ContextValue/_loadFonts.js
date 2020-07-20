import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function loadFonts() {
  Font.loadAsync({
    Roboto: require('native-base/Fonts/Roboto.ttf'),
    Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    ...Ionicons.font,
  })
    .then(() => this.setState({ fontsLoaded: true }))
    .catch(() => this.setState({ fontsLoaded: true }));
}
