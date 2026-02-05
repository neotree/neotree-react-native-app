import { AppState, Linking, NativeModules } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import type { UpdatePolicyApkRelease } from '@/src/types';
import type { UpdateDecision } from './orchestrator';

export type ApkDownloadState = {
  apkReleaseId: string;
  status: 'idle' | 'downloading' | 'downloaded' | 'verified' | 'failed';
  fileUri?: string | null;
  bytesWritten?: number;
  totalBytes?: number;
  error?: string | null;
  signatureVerified?: boolean | null;
  updatedAt?: string;
};

const APK_DIR = `${FileSystem.documentDirectory || ''}apk/`;

let activeDownload: FileSystem.DownloadResumable | null = null;
let activeReleaseId: string | null = null;

const ensureApkDir = async () => {
  if (!APK_DIR) return;
  const info = await FileSystem.getInfoAsync(APK_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(APK_DIR, { intermediates: true });
  }
};

const setState = async (state: ApkDownloadState | null) => {
  if (!state) {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_STATE);
    return;
  }
  await AsyncStorage.setItem(
    ASYNC_STORAGE_KEYS.APK_DOWNLOAD_STATE,
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
  );
};

export const getDownloadState = async (): Promise<ApkDownloadState | null> => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_STATE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const hasEnoughDiskSpace = async (bytesNeeded?: number | null) => {
  if (!bytesNeeded) return { ok: true };
  const free = await FileSystem.getFreeDiskStorageAsync();
  const ok = free > (bytesNeeded + 100 * 1024 * 1024);
  return { ok, free };
};

const hasEnoughBattery = async () => {
  try {
    const level = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();
    if (state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL) return { ok: true, level };
    return { ok: level >= 0.2, level };
  } catch {
    return { ok: true, level: null };
  }
};

const computeSha256 = async (fileUri: string) => {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const wordArray = CryptoJS.enc.Base64.parse(base64);
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
};

export const verifyApkChecksum = async (fileUri: string, expected?: string | null) => {
  if (!expected) return true;
  const hash = await computeSha256(fileUri);
  return hash.toLowerCase() === expected.toLowerCase();
};

const verifyApkSignature = async (fileUri: string, expected?: string | null) => {
  if (!expected) return true;

  const verifier = (NativeModules as any)?.ApkSignature;
  if (!verifier?.getApkSignatureSha256) {
    return true;
  }

  const sig = await verifier.getApkSignatureSha256(fileUri);
  return `${sig}`.toLowerCase() === expected.toLowerCase();
};

const isSafeToInstall = async () => {
  const active = AppState.currentState === 'active';
  if (!active) return false;
  const sessionActive = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE);
  return sessionActive !== 'true';
};

export const deferInstall = async (until: 'idle' | 'restart') => {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_INSTALL_DEFER_UNTIL, until);
};

export const clearInstallDefer = async () => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_DEFER_UNTIL);
};

export const getInstallDefer = async () => {
  const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_INSTALL_DEFER_UNTIL);
  return v as 'idle' | 'restart' | null;
};

export const installApkIfSafe = async (fileUri: string) => {
  const safe = await isSafeToInstall();
  if (!safe) throw new Error('Install blocked: app is in use');

  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  const canOpen = await Linking.canOpenURL(contentUri);
  if (!canOpen) throw new Error('Install intent unavailable');
  await Linking.openURL(contentUri);
};

export const attemptAutoInstallIfDeferred = async () => {
  const defer = await getInstallDefer();
  if (!defer) return false;

  const state = await getDownloadState();
  if (!state?.fileUri || state.status !== 'verified') return false;

  if (defer === 'restart') {
    // only try on app startup; caller should clear defer if it succeeds
    try {
      await installApkIfSafe(state.fileUri);
      await clearInstallDefer();
      return true;
    } catch {
      return false;
    }
  }

  if (defer === 'idle') {
    try {
      await installApkIfSafe(state.fileUri);
      await clearInstallDefer();
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

export const startApkDownload = async (release: UpdatePolicyApkRelease) => {
  if (!release.downloadUrl) throw new Error('Missing downloadUrl');

  await ensureApkDir();

  const targetUri = `${APK_DIR}${release.apkReleaseId}.apk`;

  const disk = await hasEnoughDiskSpace(release.fileSize || null);
  if (!disk.ok) {
    throw new Error('Insufficient disk space for APK download');
  }

  const battery = await hasEnoughBattery();
  if (!battery.ok) {
    throw new Error('Battery too low for APK download');
  }

  let resumeData: string | null = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA);

  activeReleaseId = release.apkReleaseId;
  activeDownload = FileSystem.createDownloadResumable(
    release.downloadUrl,
    targetUri,
    {},
    (progress) => {
      setState({
        apkReleaseId: release.apkReleaseId,
        status: 'downloading',
        fileUri: targetUri,
        bytesWritten: progress.totalBytesWritten,
        totalBytes: progress.totalBytesExpectedToWrite,
      }).catch(() => null);
    },
    resumeData || undefined,
  );

  await setState({ apkReleaseId: release.apkReleaseId, status: 'downloading', fileUri: targetUri });

  try {
    const result = resumeData ? await activeDownload.resumeAsync() : await activeDownload.downloadAsync();
    if (!result?.uri) throw new Error('Download failed');

    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA);
    await setState({ apkReleaseId: release.apkReleaseId, status: 'downloaded', fileUri: result.uri });

    const checksumOk = await verifyApkChecksum(result.uri, release.checksumSha256 || null);
    if (!checksumOk) {
      await setState({
        apkReleaseId: release.apkReleaseId,
        status: 'failed',
        fileUri: result.uri,
        error: 'Checksum mismatch',
      });
      throw new Error('Checksum mismatch');
    }

    let signatureVerified: boolean | null = null;
    if (release.signatureSha256) {
      try {
        const signatureOk = await verifyApkSignature(result.uri, release.signatureSha256);
        signatureVerified = signatureOk;
        if (!signatureOk) {
          await setState({
            apkReleaseId: release.apkReleaseId,
            status: 'failed',
            fileUri: result.uri,
            error: 'Signature mismatch',
            signatureVerified: false,
          });
          throw new Error('Signature mismatch');
        }
      } catch (e: any) {
        await setState({
          apkReleaseId: release.apkReleaseId,
          status: 'failed',
          fileUri: result.uri,
          error: e?.message || 'Signature verification unavailable',
          signatureVerified: false,
        });
        throw e;
      }
    }

    await setState({
      apkReleaseId: release.apkReleaseId,
      status: 'verified',
      fileUri: result.uri,
      signatureVerified: signatureVerified ?? null,
    });
    return result.uri;
  } catch (e: any) {
    try {
      const saved = await activeDownload?.pauseAsync();
      if (saved?.resumeData) {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA, saved.resumeData);
      }
    } catch {
      // ignore pause errors
    }

    await setState({
      apkReleaseId: release.apkReleaseId,
      status: 'failed',
      fileUri: targetUri,
      error: e?.message || 'Download error',
    });
    throw e;
  } finally {
    activeDownload = null;
    activeReleaseId = null;
  }
};

export const pauseApkDownload = async () => {
  if (!activeDownload) return null;
  const saved = await activeDownload.pauseAsync();
  if (saved?.resumeData) {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA, saved.resumeData);
  }
  return saved?.resumeData || null;
};

export const resumeApkDownload = async (release: UpdatePolicyApkRelease) => {
  const resumeData = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA);
  if (!resumeData) return startApkDownload(release);

  await ensureApkDir();
  const targetUri = `${APK_DIR}${release.apkReleaseId}.apk`;

  activeReleaseId = release.apkReleaseId;
  activeDownload = FileSystem.createDownloadResumable(
    release.downloadUrl || '',
    targetUri,
    {},
    (progress) => {
      setState({
        apkReleaseId: release.apkReleaseId,
        status: 'downloading',
        fileUri: targetUri,
        bytesWritten: progress.totalBytesWritten,
        totalBytes: progress.totalBytesExpectedToWrite,
      }).catch(() => null);
    },
    resumeData,
  );

  await setState({ apkReleaseId: release.apkReleaseId, status: 'downloading', fileUri: targetUri });

  const result = await activeDownload.resumeAsync();
  if (!result?.uri) throw new Error('Download failed');

  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA);
  await setState({ apkReleaseId: release.apkReleaseId, status: 'downloaded', fileUri: result.uri });

  const checksumOk = await verifyApkChecksum(result.uri, release.checksumSha256 || null);
  if (!checksumOk) {
    await setState({
      apkReleaseId: release.apkReleaseId,
      status: 'failed',
      fileUri: result.uri,
      error: 'Checksum mismatch',
    });
    throw new Error('Checksum mismatch');
  }

  let signatureVerified: boolean | null = null;
  if (release.signatureSha256) {
    const signatureOk = await verifyApkSignature(result.uri, release.signatureSha256);
    signatureVerified = signatureOk;
    if (!signatureOk) {
      await setState({
        apkReleaseId: release.apkReleaseId,
        status: 'failed',
        fileUri: result.uri,
        error: 'Signature mismatch',
        signatureVerified: false,
      });
      throw new Error('Signature mismatch');
    }
  }

  await setState({
    apkReleaseId: release.apkReleaseId,
    status: 'verified',
    fileUri: result.uri,
    signatureVerified: signatureVerified ?? null,
  });
  return result.uri;
};

export const ensureApkDownloaded = async (decision: UpdateDecision) => {
  const release = decision.currentApk;
  if (!release || !decision.shouldAutoDownload) return null;

  const state = await getDownloadState();
  if (state?.apkReleaseId === release.apkReleaseId && state.status === 'verified') {
    return state.fileUri || null;
  }

  return startApkDownload(release);
};

export const attemptAutoRetryDownload = async (decision: UpdateDecision) => {
  if (!decision?.currentApk || !decision?.shouldAutoDownload) return false;
  const state = await getDownloadState();
  if (state?.status !== 'failed') return false;
  const ok = await shouldRetryNow();
  if (!ok) return false;
  try {
    await resumeApkDownload(decision.currentApk);
    return true;
  } catch {
    await scheduleRetry(10);
    return false;
  }
};

export const scheduleRetry = async (minutes = 10) => {
  const next = new Date(Date.now() + minutes * 60000).toISOString();
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_AT, next);
};

export const shouldRetryNow = async () => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_AT);
  if (!raw) return true;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) || Date.now() >= t;
};

export const clearRetry = async () => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_AT);
};

export const getActiveDownloadReleaseId = () => activeReleaseId;
