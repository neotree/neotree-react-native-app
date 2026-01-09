import * as Application from 'expo-application';
import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

export async function getDeviceID() {
    let deviceId: null | string;
    if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
    } else {
        deviceId = await Application.getIosIdForVendorAsync();
    }
    return deviceId || randomUUID();
}
