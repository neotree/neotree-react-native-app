import { Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from 'expo-application';
import queryString from 'query-string';
import { NEOTREE_DATA_AUTHENTICATED_USER_KEY } from '../constants'; 
import { makeApiCall } from '../api';

export async function initialiseData() {
    let deviceId = null;
    if (Platform.OS === 'android') {
        deviceId = Application.androidId;
    } else {
        deviceId = await Application.getIosIdForVendorAsync();
    }

    const authenticatedUser = await AsyncStorage.getItem(NEOTREE_DATA_AUTHENTICATED_USER_KEY);
    if (authenticatedUser) {
        const res = await makeApiCall(
            'webeditor',
            `/sync-data?${queryString.stringify({ deviceId, })}`,
        );
        const json = await res.json();
        console.log(json?.webeditorInfo);
    }
}  
