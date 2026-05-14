import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

import { getDeviceID } from '@/src/utils/getDeviceID';
import { postDeviceAppState } from './api';
import { getUpdatePolicyData } from './queries';
import { ASYNC_STORAGE_KEYS } from '../constants/async-storage';
import { recordOtaAppliedIfChanged } from '@/src/update/otaTelemetry';

export async function reportAppStateIfChanged() {
    try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo?.isConnected || !netInfo?.isInternetReachable) return;

        const deviceId = await getDeviceID();
        if (!deviceId) return;

        const appVersion = Constants.expoConfig?.version || '';
        const runtimeVersion = (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || '';
        const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : null;
        const otaChannel = (Updates as any).channel || null;
        const policy = await getUpdatePolicyData().catch(() => null);
        const currentApkRelease = policy?.currentApkRelease;
        const apkReleaseId =
            currentApkRelease?.runtimeVersion === runtimeVersion && currentApkRelease?.available
                ? currentApkRelease.apkReleaseId
                : null;

        if (!appVersion || !runtimeVersion) return;

        const currentState = {
            appVersion,
            runtimeVersion,
            otaUpdateId,
            otaChannel,
            apkReleaseId,
        };

        const lastStateRaw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.LAST_REPORTED_APP_STATE);
        let lastState: any = null;
        if (lastStateRaw) {
            try {
                lastState = JSON.parse(lastStateRaw);
                if (
                    lastState?.appVersion === currentState.appVersion &&
                    lastState?.runtimeVersion === currentState.runtimeVersion &&
                    lastState?.otaUpdateId === currentState.otaUpdateId &&
                    lastState?.otaChannel === currentState.otaChannel &&
                    lastState?.apkReleaseId === currentState.apkReleaseId
                ) {
                    return;
                }
            } catch {
                // ignore parsing errors and continue
            }
        }

        const res = await postDeviceAppState({
            deviceId,
            appVersion,
            runtimeVersion,
            otaUpdateId,
            otaChannel,
            apkReleaseId: currentState.apkReleaseId,
        });

        if (res?.errors?.length) return;

        await recordOtaAppliedIfChanged(lastState, currentState);

        await AsyncStorage.setItem(
            ASYNC_STORAGE_KEYS.LAST_REPORTED_APP_STATE,
            JSON.stringify(currentState),
        );
    } catch {
        // silent - offline-first
    }
}
