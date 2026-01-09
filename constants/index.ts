import Constants from 'expo-constants';
import { Dimensions } from "react-native";

import { apiConfig } from '@/config';

export const NEOTREE_BUILD_TYPE: 'development' | 'stage' | 'production' | 'demo' = Constants.expoConfig?.extra?.NEOTREE_BUILD_TYPE || 'development';

export const API_CONFIG = apiConfig[NEOTREE_BUILD_TYPE];

export const DEFAULT_API_CONFIG_COUNTRY = Object.values(API_CONFIG)[0];

export const COUNTRIES = Object.values(API_CONFIG).map(c => ({
	label: c.name,
	value: c.iso,
}));

const { height: winHeight, width: winWidth, } = Dimensions.get('window');
const { height: screenHeight, width: screenWidth, } = Dimensions.get('screen');

export const WINDOW_HEIGHT = winHeight;
export const WINDOW_WIDTH = winHeight;
export const SCREEN_HEIGHT = screenHeight;
export const SCREEN_WIDTH = screenHeight;

export const EMAIL_REGEX = /\S+@\S+\.\S+/;
