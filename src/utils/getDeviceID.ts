import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { v4 as uuidv4 } from 'uuid';

export async function getDeviceID() {
    let deviceId: null | string;
    if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
    } else {
        deviceId = await Application.getIosIdForVendorAsync();
    }
    return deviceId || uuidv4();
}
