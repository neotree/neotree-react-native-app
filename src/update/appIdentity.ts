import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import type { UpdatePolicy, UpdatePolicyApkRelease } from '@/src/types';

export type AppRuntimeIdentity = {
  appVersion: string | null;
  nativeBuildVersion: string | null;
  runtimeVersion: string | null;
  otaUpdateId: string | null;
  otaChannel: string | null;
};

export type InstalledApkRelease = {
  apkReleaseId: string;
  versionName: string;
  versionCode: number;
  runtimeVersion: string;
  detectedAt: string;
};

export function getAppRuntimeIdentity(): AppRuntimeIdentity {
  return {
    appVersion: Application.nativeApplicationVersion || Constants.expoConfig?.version || null,
    nativeBuildVersion: Application.nativeBuildVersion || null,
    runtimeVersion: (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || null,
    otaUpdateId: Updates.updateId ? `${Updates.updateId}` : null,
    otaChannel: (Updates as any).channel || null,
  };
}

export function isReleaseInstalled(release: UpdatePolicyApkRelease | null | undefined, identity = getAppRuntimeIdentity()) {
  if (!release) return false;

  const versionNameMatches = !!identity.appVersion && `${identity.appVersion}` === `${release.versionName}`;
  const buildMatches = !!identity.nativeBuildVersion && `${identity.nativeBuildVersion}` === `${release.versionCode}`;
  const runtimeMatches = !!identity.runtimeVersion && `${identity.runtimeVersion}` === `${release.runtimeVersion}`;

  return runtimeMatches && (buildMatches || (!identity.nativeBuildVersion && versionNameMatches));
}

export async function getStoredInstalledApkRelease(): Promise<InstalledApkRelease | null> {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.INSTALLED_APK_RELEASE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function detectInstalledApkRelease(policy?: UpdatePolicy | null) {
  const identity = getAppRuntimeIdentity();
  const candidates = [policy?.currentApkRelease, policy?.rollbackApkRelease].filter(Boolean) as UpdatePolicyApkRelease[];
  const installed = candidates.find((release) => isReleaseInstalled(release, identity));

  if (!installed) {
    const stored = await getStoredInstalledApkRelease();
    const storedMatchesNative =
      !!stored &&
      `${stored.versionCode}` === `${identity.nativeBuildVersion || ''}` &&
      `${stored.runtimeVersion}` === `${identity.runtimeVersion || ''}`;
    const storedIsPolicyCandidate =
      !candidates.length || candidates.some((release) => release.apkReleaseId === stored?.apkReleaseId);

    if (storedMatchesNative && storedIsPolicyCandidate) return stored;
    return null;
  }

  const payload: InstalledApkRelease = {
    apkReleaseId: installed.apkReleaseId,
    versionName: installed.versionName,
    versionCode: installed.versionCode,
    runtimeVersion: installed.runtimeVersion,
    detectedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.INSTALLED_APK_RELEASE, JSON.stringify(payload));
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING);
  return payload;
}
