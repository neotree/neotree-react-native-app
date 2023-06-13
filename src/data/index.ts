import { Platform } from 'react-native';

export const api = Platform.OS === 'web' ? 
	require('./web') : require('./device');
