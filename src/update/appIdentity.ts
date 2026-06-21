import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import type { UpdatePolicy, UpdatePolicyApkRelease } from '@/src/types';
import { NEOTREE_UPDATE_RELEASE } from './releaseInfo';
import { parseNativeBuildVersion } from './versioning';

export type AppRuntimeIdentity = {
  appVersion: string | null;
  nativeBuildVersion: string | null;
  runtimeVersion: string | null;
  updateRelease: string;
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
    updateRelease: NEOTREE_UPDATE_RELEASE.label,
    otaUpdateId: Updates.updateId ? `${Updates.updateId}` : null,
    otaChannel: (Updates as any).channel || null,
  };
}

export function isReleaseInstalled(release: UpdatePolicyApkRelease | null | undefined, identity = getAppRuntimeIdentity()) {
  if (!release) return false;

  const versionNameMatches = !!identity.appVersion && `${identity.appVersion}` === `${release.versionName}`;
  const nativeBuildVersion = parseNativeBuildVersion(identity.nativeBuildVersion);
  const buildMatches = nativeBuildVersion !== null && nativeBuildVersion === release.versionCode;
  const runtimeMatches = !!identity.runtimeVersion && `${identity.runtimeVersion}` === `${release.runtimeVersion}`;

  // The Android versionCode (Application.nativeBuildVersion) is the authoritative
  // identity of the installed binary for a given package — two builds with the
  // same versionCode ARE the same APK. So an equal versionCode means "installed",
  // regardless of any runtimeVersion/versionName drift in the editor's release
  // metadata. Previously this required runtimeVersion to also match, which made a
  // device that already ran the release report "not installed" whenever the
  // admin-entered runtimeVersion differed from what the device reported — the
  // root cause of phantom "update available" notices. Only when the native build
  // number is unavailable do we fall back to runtime + versionName.
  if (buildMatches) return true;
  return nativeBuildVersion === null && runtimeMatches && versionNameMatches;
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
    // Mirror isReleaseInstalled(): the Android versionCode is authoritative. When
    // we have a native build number, an equal versionCode means the stored record
    // describes the running binary (runtime metadata drift must not invalidate it).
    // Only fall back to a runtime check when the native build number is unavailable.
    const nativeBuildVersion = parseNativeBuildVersion(identity.nativeBuildVersion);
    const buildMatches = nativeBuildVersion !== null && stored?.versionCode === nativeBuildVersion;
    const runtimeMatches =
      nativeBuildVersion === null && `${stored?.runtimeVersion}` === `${identity.runtimeVersion || ''}`;
    const storedMatchesNative = !!stored && (buildMatches || runtimeMatches);
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
