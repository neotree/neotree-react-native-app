import { AppState, Linking, NativeModules, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Battery from 'expo-battery';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CryptoJS from 'crypto-js';

import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import { getMobileDeviceHeaders } from '@/src/data/api';
import { getUpdatePolicyData } from '@/src/data/queries';
import type { UpdatePolicyApkRelease } from '@/src/types';
import type { UpdateDecision } from './orchestrator';
import { recordUpdateEvent } from './otaTelemetry';
import { getAppRuntimeIdentity } from './appIdentity';
import { parseNativeBuildVersion } from './versioning';
import { decideBackgroundDownloadAction, type BackgroundDownloadAction } from './backgroundDownloadDecision';

export { decideBackgroundDownloadAction };
export type { BackgroundDownloadAction };

export type ApkDownloadState = {
  apkReleaseId: string;
  status: 'idle' | 'downloading' | 'paused' | 'downloaded' | 'verified' | 'failed';
  fileUri?: string | null;
  bytesWritten?: number;
  totalBytes?: number;
  error?: string | null;
  signatureVerified?: boolean | null;
  updatedAt?: string;
};

type ApkInstallMetadata = Pick<UpdatePolicyApkRelease, 'apkReleaseId'> & Partial<UpdatePolicyApkRelease>;

const APK_DIR = `${FileSystem.documentDirectory || ''}apk/`;

let activeDownload: FileSystem.DownloadResumable | null = null;
let activeReleaseId: string | null = null;
let activeDownloadPromise: Promise<string> | null = null;
// Set while a user-initiated pause is in flight so the download promise's catch
// (expo rejects the in-flight download when paused) preserves the 'paused' state
// instead of overwriting it with 'failed'.
let pauseRequested = false;

const ensureApkDir = async () => {
  if (!APK_DIR) return;
  const info = await FileSystem.getInfoAsync(APK_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(APK_DIR, { intermediates: true });
  }
};

/**
 * Removes stale downloaded APKs so the directory doesn't grow unbounded over the
 * life of the tablet. Keeps only the file for `keepReleaseId` (the one we are
 * about to download / have just verified).
 */
export const cleanupApkDir = async (keepReleaseId?: string | null) => {
  if (!APK_DIR) return;
  try {
    const info = await FileSystem.getInfoAsync(APK_DIR);
    if (!info.exists) return;
    const entries = await FileSystem.readDirectoryAsync(APK_DIR);
    const keepName = keepReleaseId ? `${keepReleaseId}.apk` : null;
    await Promise.all(
      entries
        .filter((name) => name.endsWith('.apk') && name !== keepName)
        .map((name) => FileSystem.deleteAsync(`${APK_DIR}${name}`, { idempotent: true }).catch(() => null)),
    );
  } catch {
    // best-effort cleanup
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

/**
 * Clears the persisted download state. Used when the tablet is up to date so a
 * stale `verified` record can't make the UI (banner / ready-prompt) think there
 * is still an update to install against a file that has been cleaned up.
 */
export const clearDownloadState = async () => {
  await setState(null);
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
  const verifier = (NativeModules as any)?.ApkSignature;
  if (verifier?.getFileSha256) {
    return `${await verifier.getFileSha256(fileUri)}`.toLowerCase();
  }

  const info = await FileSystem.getInfoAsync(fileUri);
  const legacyMaxBytes = 60 * 1024 * 1024;
  if (info.exists && typeof (info as any).size === 'number' && (info as any).size > legacyMaxBytes) {
    throw new Error('APK checksum verification requires the latest NeoTree build. Please install the latest APK before using in-app APK downloads.');
  }

  // Compatibility fallback for older builds that do not yet include the native
  // streaming hasher. Current APK builds use ApkSignature.getFileSha256 above.
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
    throw new Error('APK signature verification is required but unavailable on this build');
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
  await recordUpdateEvent('apk_install_deferred', { until }).catch(() => null);
};

export const clearInstallDefer = async () => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_DEFER_UNTIL);
};

export const getInstallDefer = async () => {
  const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_INSTALL_DEFER_UNTIL);
  return v as 'idle' | 'restart' | null;
};

export const installApkIfSafe = async (fileUri: string, release?: ApkInstallMetadata | null) => {
  const safe = await isSafeToInstall();
  if (!safe) {
    await recordUpdateEvent('apk_install_blocked', {
      apkReleaseId: release?.apkReleaseId || null,
      reason: 'app_in_use',
    }).catch(() => null);
    throw new Error('Install blocked: app is in use');
  }

  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await AsyncStorage.setItem(
    ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING,
    JSON.stringify({
      apkReleaseId: release?.apkReleaseId || null,
      versionName: release?.versionName || null,
      versionCode: release?.versionCode || null,
      runtimeVersion: release?.runtimeVersion || null,
      fileUri,
      startedAt: new Date().toISOString(),
    }),
  );
  await recordUpdateEvent('apk_install_started', { apkReleaseId: release?.apkReleaseId || null }).catch(() => null);

  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/vnd.android.package-archive',
        flags: 1,
      });
    } catch (e: any) {
      await recordUpdateEvent('apk_install_blocked', {
        apkReleaseId: release?.apkReleaseId || null,
        reason: 'installer_permission_or_intent_failed',
        message: e?.message || 'Install intent failed',
      }).catch(() => null);
      try {
        await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
          data: `package:${Application.applicationId || ''}`,
        });
      } catch {
        await Linking.openSettings().catch(() => null);
      }
      throw new Error('Install permission required. Allow app installs from settings, then try again.');
    }
    return;
  }

  const canOpen = await Linking.canOpenURL(contentUri);
  if (!canOpen) {
    await recordUpdateEvent('apk_install_blocked', {
      apkReleaseId: release?.apkReleaseId || null,
      reason: 'install_intent_unavailable',
    }).catch(() => null);
    throw new Error('Install intent unavailable');
  }
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
      await installApkIfSafe(state.fileUri, { apkReleaseId: state.apkReleaseId });
      await clearInstallDefer();
      return true;
    } catch {
      return false;
    }
  }

  if (defer === 'idle') {
    try {
      await installApkIfSafe(state.fileUri, { apkReleaseId: state.apkReleaseId });
      await clearInstallDefer();
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

const markDownloadedAndVerified = async (release: UpdatePolicyApkRelease, fileUri: string) => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA);
  await setState({ apkReleaseId: release.apkReleaseId, status: 'downloaded', fileUri });
  await recordUpdateEvent('apk_downloaded', { apkReleaseId: release.apkReleaseId }).catch(() => null);

  const checksumOk = await verifyApkChecksum(fileUri, release.checksumSha256 || null);
  if (!checksumOk) {
    await setState({
      apkReleaseId: release.apkReleaseId,
      status: 'failed',
      fileUri,
      error: 'Checksum mismatch',
    });
    throw new Error('Checksum mismatch');
  }

  let signatureVerified: boolean | null = null;
  if (release.signatureSha256) {
    try {
      const signatureOk = await verifyApkSignature(fileUri, release.signatureSha256);
      signatureVerified = signatureOk;
      if (!signatureOk) {
        await setState({
          apkReleaseId: release.apkReleaseId,
          status: 'failed',
          fileUri,
          error: 'Signature mismatch',
          signatureVerified: false,
        });
        throw new Error('Signature mismatch');
      }
    } catch (e: any) {
      await setState({
        apkReleaseId: release.apkReleaseId,
        status: 'failed',
        fileUri,
        error: e?.message || 'Signature verification unavailable',
        signatureVerified: false,
      });
      throw e;
    }
  }

  await setState({
    apkReleaseId: release.apkReleaseId,
    status: 'verified',
    fileUri,
    signatureVerified: signatureVerified ?? null,
  });
  await recordUpdateEvent('apk_verified', {
    apkReleaseId: release.apkReleaseId,
    signatureVerified: signatureVerified ?? null,
  }).catch(() => null);

  return fileUri;
};

export const startApkDownload = async (release: UpdatePolicyApkRelease) => {
  if (!release.downloadUrl) throw new Error('Missing downloadUrl');

  if (activeReleaseId === release.apkReleaseId && activeDownloadPromise) {
    return activeDownloadPromise;
  }

  const existingState = await getDownloadState();
  if (existingState?.apkReleaseId === release.apkReleaseId) {
    if (existingState.status === 'verified' && existingState.fileUri) {
      const info = await FileSystem.getInfoAsync(existingState.fileUri);
      if (info.exists) return existingState.fileUri;
    }
    if (existingState.status === 'downloading' && activeDownloadPromise) {
      return activeDownloadPromise;
    }
  }

  await ensureApkDir();
  // Drop any previously downloaded releases before fetching the new one.
  await cleanupApkDir(release.apkReleaseId);

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
  const headers = await getMobileDeviceHeaders({ method: 'GET', endpoint: release.downloadUrl });

  activeReleaseId = release.apkReleaseId;
  activeDownload = FileSystem.createDownloadResumable(
    release.downloadUrl,
    targetUri,
    { headers },
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
  // A new/resumed transfer clears any prior pause request.
  pauseRequested = false;

  let downloadPromise!: Promise<string>;
  downloadPromise = (async () => {
    try {
      await recordUpdateEvent(resumeData ? 'apk_download_resumed' : 'apk_download_started', {
        apkReleaseId: release.apkReleaseId,
        versionName: release.versionName,
        versionCode: release.versionCode,
        runtimeVersion: release.runtimeVersion,
      }).catch(() => null);

      const result = resumeData ? await activeDownload.resumeAsync() : await activeDownload.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');

      return markDownloadedAndVerified(release, result.uri);
    } catch (e: any) {
      // A user pause rejects the in-flight download. That is not a failure:
      // pauseApkDownload has already persisted resumeData and the 'paused' state,
      // so leave both intact and exit quietly.
      if (pauseRequested) {
        pauseRequested = false;
        throw e;
      }

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
      await recordUpdateEvent('apk_download_failed', {
        apkReleaseId: release.apkReleaseId,
        message: e?.message || 'Download error',
      }).catch(() => null);
      throw e;
    } finally {
      if (activeDownloadPromise === downloadPromise) {
        activeDownload = null;
        activeReleaseId = null;
        activeDownloadPromise = null;
      }
    }
  })();

  activeDownloadPromise = downloadPromise;
  return downloadPromise;
};

export const pauseApkDownload = async () => {
  if (!activeDownload) return null;

  // Flag the pause first so the download promise's catch keeps the 'paused' state.
  pauseRequested = true;
  const saved = await activeDownload.pauseAsync();
  if (saved?.resumeData) {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RESUME_DATA, saved.resumeData);
  }

  // Persist an explicit 'paused' state, preserving progress so the bar holds its
  // position and the UI can offer a Resume control (instead of looking stalled).
  const current = await getDownloadState();
  await setState({
    apkReleaseId: activeReleaseId || current?.apkReleaseId || '',
    status: 'paused',
    fileUri: current?.fileUri,
    bytesWritten: current?.bytesWritten,
    totalBytes: current?.totalBytes,
  });

  await recordUpdateEvent('apk_download_paused', { apkReleaseId: activeReleaseId }).catch(() => null);
  return saved?.resumeData || null;
};

export const resumeApkDownload = async (release: UpdatePolicyApkRelease) => {
  // `startApkDownload` already resumes from persisted resumeData when present
  // (otherwise it starts fresh) AND de-duplicates against an in-flight download
  // via the shared `activeDownloadPromise`. Delegating to it keeps "resume" and
  // "start" on one race-free code path, so a manual Resume tap, the post-sync
  // auto-retry and the connectivity-aware background controller can never spawn
  // two writers against the same partial file.
  return startApkDownload(release);
};

export const ensureApkDownloaded = async (decision: UpdateDecision) => {
  const release = decision.currentApk;
  if (!release || !decision.shouldAutoDownload) return null;

  const state = await getDownloadState();
  if (state?.apkReleaseId === release.apkReleaseId && state.status === 'verified') {
    return state.fileUri || null;
  }
  // Respect an explicit user pause: never auto-(re)start it from a routine sync.
  if (state?.apkReleaseId === release.apkReleaseId && state.status === 'paused') {
    return null;
  }

  return startApkDownload(release);
};

export type DriveDownloadResult = { action: BackgroundDownloadAction; fileUri?: string | null; error?: string };

/**
 * Connectivity-aware background download driver. This is the piece that gives the
 * APK channel OTA-grade behaviour: once an update is found it downloads in the
 * background, and — crucially — when the connection drops and later returns it
 * resumes from exactly where it left off (expo's resumeData) rather than waiting
 * for the next content sync or a manual tap. Idempotent and de-duplicated, so the
 * app root can safely call it on reconnect, on foreground and on a slow safety-net
 * interval until the file is verified.
 */
// Wi-Fi-only enforcement (#2): when the policy is Wi-Fi-only, hold the auto-download
// on metered/cellular links. Short-circuits without touching NetInfo when the policy
// does not require Wi-Fi, and fails open (does not block) if connection type is
// unknown — an update should never be starved because we couldn't read the network.
const isMeteredBlocked = async (decision: UpdateDecision | null | undefined): Promise<boolean> => {
  if (!decision?.policy?.apk?.wifiOnly) return false;
  try {
    const net = await NetInfo.fetch();
    const isUnmetered = net.type === 'wifi' || net.type === 'ethernet';
    const expensive =
      net.details && 'isConnectionExpensive' in net.details
        ? (net.details as { isConnectionExpensive?: boolean }).isConnectionExpensive
        : null;
    return !isUnmetered || expensive === true;
  } catch {
    return false;
  }
};

export const driveApkBackgroundDownload = async (
  decision: UpdateDecision | null | undefined,
  opts?: { ignoreBackoff?: boolean },
): Promise<DriveDownloadResult> => {
  const state = await getDownloadState();
  const action = decideBackgroundDownloadAction({
    decision,
    state,
    activeReleaseId: getActiveDownloadReleaseId(),
    retryReady: await shouldRetryNow(),
    ignoreBackoff: opts?.ignoreBackoff,
    meteredBlocked: await isMeteredBlocked(decision),
  });

  if (action === 'verified') {
    // Defence in depth: a 'verified' record pointing at a file that has since been
    // cleaned up must fall through to a fresh download, not silently stall.
    if (state?.fileUri) {
      const info = await FileSystem.getInfoAsync(state.fileUri);
      if (info.exists) return { action: 'verified', fileUri: state.fileUri };
    }
  } else if (action !== 'download') {
    return { action };
  }

  const release = decision!.currentApk!;
  try {
    const fileUri = await startApkDownload(release);
    await resetDownloadBackoff();
    return { action: 'download', fileUri };
  } catch (e: any) {
    await scheduleEscalatingRetry();
    return { action: 'download', error: e?.message || 'Download error' };
  }
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

// Escalating backoff for *unattended* background retries. A reconnect is a strong
// signal and bypasses this (immediate resume); the backoff only paces the
// "still online but the fetch keeps failing" case so a flaky CDN / server is not
// hammered. It resets on a successful (re)start and on a fresh reconnect.
const RETRY_BACKOFF_MINUTES = [1, 2, 5, 10, 15, 30];

export const scheduleEscalatingRetry = async () => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_ATTEMPTS);
  const attempt = Math.max(0, Number(raw) || 0);
  const minutes = RETRY_BACKOFF_MINUTES[Math.min(attempt, RETRY_BACKOFF_MINUTES.length - 1)];
  await scheduleRetry(minutes);
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_ATTEMPTS, `${attempt + 1}`);
  return minutes;
};

export const resetDownloadBackoff = async () => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_DOWNLOAD_RETRY_ATTEMPTS);
  await clearRetry();
};

export const getActiveDownloadReleaseId = () => activeReleaseId;

// ---------------------------------------------------------------------------
// Post-install health verification (#4)
//
// When an install is started we persist APK_INSTALL_PENDING. On a later launch we
// confirm the device is actually running the target build:
//  - running versionCode >= target  -> install succeeded (emit apk_installed)
//  - target not reached within the   -> install did not take (emit apk_install_failed,
//    health window                       which the server maps to a rollback signal
//                                         and feeds the auto-halt evaluator)
// This closes the loop so a build that fails to apply across the fleet is detected
// and can be pulled back, instead of silently appearing "shipped".
// ---------------------------------------------------------------------------

const DEFAULT_INSTALL_HEALTH_HOURS = 24;

export type ApkInstallHealthOutcome = 'succeeded' | 'failed' | 'pending' | 'none';

export const reconcileApkInstallHealth = async (): Promise<ApkInstallHealthOutcome> => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING);
  if (!raw) return 'none';

  let pending: any;
  try {
    pending = JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING);
    return 'none';
  }

  const targetCode = parseNativeBuildVersion(pending?.versionCode);
  const identity = getAppRuntimeIdentity();
  const runningCode = parseNativeBuildVersion(identity.nativeBuildVersion);

  // Success: the device is now running the target build (or newer).
  if (targetCode !== null && runningCode !== null && runningCode >= targetCode) {
    await recordUpdateEvent('apk_installed', {
      apkReleaseId: pending?.apkReleaseId || null,
      versionName: pending?.versionName || identity.appVersion,
      versionCode: runningCode,
      runtimeVersion: pending?.runtimeVersion || identity.runtimeVersion,
    }).catch(() => null);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING);
    return 'succeeded';
  }

  // Failure: the health window has elapsed and the target build is still not live.
  const policy = await getUpdatePolicyData().catch(() => null);
  const windowHours = Math.max(1, Number(policy?.apk?.healthCheckHours) || DEFAULT_INSTALL_HEALTH_HOURS);
  const startedAt = pending?.startedAt ? new Date(pending.startedAt).getTime() : null;
  if (startedAt !== null && Date.now() - startedAt >= windowHours * 60 * 60 * 1000) {
    await recordUpdateEvent('apk_install_failed', {
      apkReleaseId: pending?.apkReleaseId || null,
      reason: 'post_install_not_applied',
      targetVersionCode: targetCode,
      runningVersionCode: runningCode,
    }).catch(() => null);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.APK_INSTALL_PENDING);
    return 'failed';
  }

  return 'pending';
};

// ---------------------------------------------------------------------------
// Offline peer-to-peer distribution
//
// For sites that are permanently offline, tablets must be able to pass the
// update to each other without the internet:
//  - shareUpdateFile():  send this tablet's downloaded update to another tablet
//                        (Bluetooth / Nearby Share / WhatsApp / Files / USB).
//  - importUpdateFromFile(): pick an .apk that arrived by any of those means and
//                        verify it against the approved update before installing.
// ---------------------------------------------------------------------------

const findAnyApkInDir = async (): Promise<string | null> => {
  if (!APK_DIR) return null;
  try {
    const info = await FileSystem.getInfoAsync(APK_DIR);
    if (!info.exists) return null;
    const entries = await FileSystem.readDirectoryAsync(APK_DIR);
    const apk = entries.find((name) => name.toLowerCase().endsWith('.apk'));
    return apk ? `${APK_DIR}${apk}` : null;
  } catch {
    return null;
  }
};

const apkNativeModule = () => (NativeModules as any)?.ApkSignature || null;

export type NativeApkInfo = {
  packageName: string | null;
  versionName: string | null;
  versionCode: number | null;
  signatureSha256: string | null;
};

const getNativeApkInfo = async (fileUri: string): Promise<NativeApkInfo | null> => {
  const mod = apkNativeModule();
  if (!mod?.getApkInfo) return null;
  try {
    const info = await mod.getApkInfo(fileUri);
    return {
      packageName: info?.packageName || null,
      versionName: info?.versionName || null,
      versionCode: info?.versionCode != null ? Number(info.versionCode) : null,
      signatureSha256: info?.signatureSha256 || null,
    };
  } catch {
    return null;
  }
};

/**
 * Copies this app's own installed APK into shareable storage so a tablet that
 * only has the app installed (never downloaded a file) can still seed peers (#1).
 */
const exportInstalledApk = async (): Promise<string | null> => {
  const mod = apkNativeModule();
  if (!mod?.getInstalledApkPath) return null;
  try {
    const sourceDir: string = await mod.getInstalledApkPath();
    if (!sourceDir) return null;
    await ensureApkDir();
    const version = Application.nativeApplicationVersion || 'latest';
    const dest = `${APK_DIR}neotree-${version}.apk`;
    const from = sourceDir.startsWith('file://') ? sourceDir : `file://${sourceDir}`;
    await FileSystem.copyAsync({ from, to: dest });
    return dest;
  } catch {
    return null;
  }
};

/** True when this tablet can pass an update on to another tablet. */
export const hasShareableUpdate = async (): Promise<boolean> => {
  const state = await getDownloadState();
  if (state?.status === 'verified' && state.fileUri) return true;
  if (await findAnyApkInDir()) return true;
  // The installed app itself can be shared if the native helper is available.
  return !!apkNativeModule()?.getInstalledApkPath;
};

/**
 * Opens the Android share sheet so the user can send the downloaded update file
 * to another tablet by whatever channel they have (Bluetooth, Nearby Share,
 * WhatsApp, a file copy to a USB stick / SD card, etc.).
 */
export const shareUpdateFile = async () => {
  const state = await getDownloadState();
  // Prefer a downloaded update file; otherwise fall back to sharing this app's
  // own installed APK so any tablet can seed its peers offline.
  const fileUri =
    (state?.status === 'verified' && state.fileUri)
      ? state.fileUri
      : (await findAnyApkInDir()) || (await exportInstalledApk());
  if (!fileUri) {
    throw new Error('This tablet does not have an update file to share yet.');
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this tablet.');
  }

  await recordUpdateEvent('apk_shared_offline', { fileUri }).catch(() => null);
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.android.package-archive',
    dialogTitle: 'Send the NeoTree update to another tablet',
  });
};

export type ImportedApk = {
  fileUri: string;
  fileName: string;
  size: number;
  checksumSha256: string;
  /** The approved release this file matches, if any (offline verification). */
  matchedReleaseId: string | null;
  matchedVersionName: string | null;
  /** True when the file's checksum matches an approved update in the cached policy. */
  verifiedAgainstPolicy: boolean;
  /** False when no policy is cached, so we could not check it (still installable). */
  couldCheck: boolean;
  /** True when native APK inspection proved this is the same app and not a downgrade. */
  trustedByPackageInspection: boolean;
  /** Read from the APK itself (when the native helper is available). */
  packageName: string | null;
  versionName: string | null;
  versionCode: number | null;
  /** True when the file is a different app from this one (wrong APK). */
  wrongPackage: boolean;
  /** True when the file is an older build than what is installed (Android will block it). */
  isDowngrade: boolean;
};

/**
 * Lets the user pick an .apk that arrived on the tablet (USB, SD card, Bluetooth,
 * WhatsApp, etc.), copies it into app storage and verifies it against the cached
 * approved update where possible. Returns null if the user cancels.
 */
export const importUpdateFromFile = async (): Promise<ImportedApk | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/vnd.android.package-archive', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const fileName = asset.name || 'update.apk';

  const looksLikeApk =
    fileName.toLowerCase().endsWith('.apk') ||
    asset.mimeType === 'application/vnd.android.package-archive';
  if (!looksLikeApk) {
    throw new Error('That file is not an Android app (.apk). Please choose the NeoTree update file.');
  }

  await ensureApkDir();
  const targetUri = `${APK_DIR}imported-${Date.now()}.apk`;
  await FileSystem.copyAsync({ from: asset.uri, to: targetUri });

  const checksumSha256 = await computeSha256(targetUri);

  // Verify against the approved update if we have a cached policy.
  let policy = null;
  try {
    policy = await getUpdatePolicyData();
  } catch {
    policy = null;
  }
  const candidates = [policy?.currentApkRelease, policy?.rollbackApkRelease].filter(Boolean) as UpdatePolicyApkRelease[];
  const couldCheck = candidates.some((release) => !!release.checksumSha256);
  const matched = candidates.find(
    (release) => (release.checksumSha256 || '').toLowerCase() === checksumSha256.toLowerCase(),
  ) || null;

  // Inspect the APK itself (package + version) to catch a wrong app or an older build.
  const nativeInfo = await getNativeApkInfo(targetUri);
  const installedPackage = Application.applicationId || null;
  const installedBuild = Number(Application.nativeBuildVersion);
  const wrongPackage = !!(nativeInfo?.packageName && installedPackage && nativeInfo.packageName !== installedPackage);
  const isDowngrade = !!(
    nativeInfo?.versionCode != null &&
    Number.isFinite(installedBuild) &&
    nativeInfo.versionCode < installedBuild
  );
  const trustedByPackageInspection = !!(
    !couldCheck &&
    nativeInfo?.packageName &&
    installedPackage &&
    nativeInfo.packageName === installedPackage &&
    !isDowngrade
  );

  await recordUpdateEvent('apk_imported_offline', {
    apkReleaseId: matched?.apkReleaseId || null,
    verified: !!matched,
    checksumSha256,
    packageName: nativeInfo?.packageName || null,
    versionCode: nativeInfo?.versionCode ?? null,
    wrongPackage,
    isDowngrade,
    trustedByPackageInspection,
  }).catch(() => null);

  return {
    fileUri: targetUri,
    fileName,
    size: asset.size || 0,
    checksumSha256,
    matchedReleaseId: matched?.apkReleaseId || null,
    matchedVersionName: matched?.versionName || null,
    verifiedAgainstPolicy: !!matched,
    couldCheck,
    trustedByPackageInspection,
    packageName: nativeInfo?.packageName || null,
    versionName: nativeInfo?.versionName || null,
    versionCode: nativeInfo?.versionCode ?? null,
    wrongPackage,
    isDowngrade,
  };
};

/**
 * Installs a file the user imported offline. When it matched an approved release
 * we re-check its signing certificate (defence in depth); Android additionally
 * refuses any APK not signed with the installed app's key.
 */
export const installImportedApk = async (imported: ImportedApk) => {
  if (imported.wrongPackage) {
    throw new Error('This file is not a NeoTree update. It was not installed.');
  }
  if (imported.isDowngrade) {
    throw new Error('This update is older than the version already installed.');
  }
  if (!imported.verifiedAgainstPolicy && !imported.trustedByPackageInspection) {
    throw new Error('NeoTree could not verify this update file. Connect to the internet to refresh update information, or ask your administrator for the approved update file.');
  }

  const matched: ApkInstallMetadata | null = imported.matchedReleaseId
    ? { apkReleaseId: imported.matchedReleaseId, versionName: imported.matchedVersionName || undefined }
    : null;

  if (imported.verifiedAgainstPolicy && imported.matchedReleaseId) {
    const policy = await getUpdatePolicyData().catch(() => null);
    const release = [policy?.currentApkRelease, policy?.rollbackApkRelease]
      .filter(Boolean)
      .find((r) => (r as UpdatePolicyApkRelease).apkReleaseId === imported.matchedReleaseId) as UpdatePolicyApkRelease | undefined;
    if (release?.signatureSha256) {
      const ok = await verifyApkSignature(imported.fileUri, release.signatureSha256);
      if (!ok) throw new Error('This file failed the signature check and was not installed.');
    }
  }

  await installApkIfSafe(imported.fileUri, matched);
};
