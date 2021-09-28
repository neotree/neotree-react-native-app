import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as types from '../types';

export const APP_NAME = Constants.manifest.name;
export const ENV = Constants.manifest.extra as types.ENV;
export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;

