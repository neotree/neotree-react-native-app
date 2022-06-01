import { Dimensions } from 'react-native';
import Constants from 'expo-constants';

export * from './config';

const { width, height } = Dimensions.get('window');

export const CONFIG = Constants.manifest.extra;

const _config = {
  ...Constants.manifest.extra,
  APP_VERSION: Constants.manifest.version,

  APP_TITLE: 'NeoTree',

  SCREEN_HEIGHT: height,
  SCREEM_WIDTH: width,

  SPLASH_LOGO_HEIGHT: 100,
  SPLASH_LOGO_WIDTH: 100,

  DEFAULT_SPACING: 10,
};

export default _config;
