import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

import { getDeviceID } from '@/src/utils/getDeviceID';
import { postDeviceAppState } from './api';
import { getApplication, getLocation, getUpdatePolicyData } from './queries';
import { ASYNC_STORAGE_KEYS } from '../constants/async-storage';
import { recordOtaAppliedIfChanged, recordUpdateEvent } from '@/src/update/otaTelemetry';
import { detectInstalledApkRelease, getAppRuntimeIdentity } from '@/src/update/appIdentity';

const APP_STATE_REPORT_SCHEMA_VERSION = 2;

export async function reportAppStateIfChanged() {
    try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo?.isConnected || !netInfo?.isInternetReachable) return;

        const deviceId = await getDeviceID();
        if (!deviceId) return;

        const identity = getAppRuntimeIdentity();
        const policy = await getUpdatePolicyData().catch(() => null);
        const location = await getLocation().catch(() => null);
        const application = await getApplication().catch(() => null);
        const installedApk = await detectInstalledApkRelease(policy);
        const appVersion = identity.appVersion || '';
        const runtimeVersion = identity.runtimeVersion || '';
        const updateRelease = identity.updateRelease;
        const otaUpdateId = identity.otaUpdateId;
        const otaChannel = identity.otaChannel;
        const apkReleaseId = installedApk?.apkReleaseId || null;
        const androidId = Application.getAndroidId?.() || deviceId;
        const deviceHash = application?.uid_prefix || null;
        const manufacturer = Device.manufacturer || null;
        const model = Device.modelName || Device.modelId || null;
        const androidVersion = Device.osVersion || null;
        const androidSdk = Number.isFinite(Number(Device.platformApiLevel)) ? Number(Device.platformApiLevel) : null;
        const deviceCapabilities = {
            deviceHash,
            androidId,
            identifiers: {
                deviceId,
                androidId,
                deviceHash,
            },
            updateDelivery: {
                inAppApkInstall: true,
                offlineApkShare: true,
                otaUpdates: true,
            },
            software: {
                appVersion,
                runtimeVersion,
                updateRelease,
                otaUpdateId,
                otaChannel,
            },
        };

        if (!appVersion || !runtimeVersion) return;

        const currentState = {
            reportSchemaVersion: APP_STATE_REPORT_SCHEMA_VERSION,
            deviceHash,
            appVersion,
            runtimeVersion,
            updateRelease,
            countryISO: location?.country || null,
            androidVersion,
            androidSdk,
            manufacturer,
            model,
            deviceCapabilities,
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
                    lastState?.reportSchemaVersion === currentState.reportSchemaVersion &&
                    lastState?.runtimeVersion === currentState.runtimeVersion &&
                    lastState?.updateRelease === currentState.updateRelease &&
                    lastState?.deviceHash === currentState.deviceHash &&
                    lastState?.countryISO === currentState.countryISO &&
                    lastState?.androidVersion === currentState.androidVersion &&
                    lastState?.androidSdk === currentState.androidSdk &&
                    lastState?.manufacturer === currentState.manufacturer &&
                    lastState?.model === currentState.model &&
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
            deviceHash,
            appVersion,
            runtimeVersion,
            countryISO: currentState.countryISO,
            androidVersion,
            androidSdk,
            manufacturer,
            model,
            deviceCapabilities,
            otaUpdateId,
            otaChannel,
            updateRelease,
            apkReleaseId: currentState.apkReleaseId,
        });

        if (res?.errors?.length) return;

        await recordOtaAppliedIfChanged(lastState, currentState);
        if (currentState.apkReleaseId && lastState?.apkReleaseId !== currentState.apkReleaseId) {
            await recordUpdateEvent('apk_installed', { apkReleaseId: currentState.apkReleaseId });
        }

        await AsyncStorage.setItem(
            ASYNC_STORAGE_KEYS.LAST_REPORTED_APP_STATE,
            JSON.stringify(currentState),
        );
    } catch {
        // silent - offline-first
    }
}
