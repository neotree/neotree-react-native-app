import React from 'react';
import { Alert, AppState } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppContext } from '@/src/AppContext';
import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import {
  getDownloadState,
  installApkIfSafe,
  isUpdatesScreenFocused,
  updateCopy,
} from '@/src/update';

const canOfferInAppInstall = (mode?: string | null) =>
  mode === 'in_app' || mode === 'hybrid' || !mode;

// How long to wait before prompting again after the user defers an update.
const SNOOZE_MS = 24 * 60 * 60 * 1000;

// After the user taps "Install" we snooze only briefly. This stops the prompt
// re-appearing the instant the user returns from the OS package installer,
// while still letting it come back soon if the install was blocked (e.g.
// "install unknown apps" is off) rather than going silent for a whole day.
const INSTALL_RETRY_MS = 30 * 60 * 1000;

type PromptRecord = { releaseId: string; until: number };

const readPromptRecord = async (): Promise<PromptRecord | null> => {
  const raw = await AsyncStorage.getItem(
    ASYNC_STORAGE_KEYS.APK_READY_PROMPTED_RELEASE_ID,
  );
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.releaseId === 'string') {
      if (typeof parsed.until === 'number') return parsed as PromptRecord;
      // Legacy record stored the prompt time as `at`; derive the window.
      if (typeof parsed.at === 'number') {
        const migrated = { releaseId: parsed.releaseId, until: parsed.at + SNOOZE_MS };
        await AsyncStorage.setItem(
          ASYNC_STORAGE_KEYS.APK_READY_PROMPTED_RELEASE_ID,
          JSON.stringify(migrated),
        ).catch(() => null);
        return migrated;
      }
    }
  } catch {
    // Legacy value was a bare release id string. Treat it as expired so older
    // tablets do not keep snoozing the same release forever.
    const migrated = { releaseId: raw, until: 0 };
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.APK_READY_PROMPTED_RELEASE_ID,
      JSON.stringify(migrated),
    ).catch(() => null);
    return migrated;
  }
  return null;
};

const snoozeRelease = (releaseId: string, ms: number) =>
  AsyncStorage.setItem(
    ASYNC_STORAGE_KEYS.APK_READY_PROMPTED_RELEASE_ID,
    JSON.stringify({ releaseId, until: Date.now() + ms }),
  ).catch(() => null);

export function ApkUpdateReadyPrompt() {
  const { updateDecision } = useAppContext() || {};
  const prompting = React.useRef(false);

  React.useEffect(() => {
    let mounted = true;

    const check = async () => {
      if (prompting.current) return;

      // Cheap in-memory gates first so the interval does no I/O when there is
      // nothing to install.
      const decision = updateDecision;
      if (!decision) return;
      // Only offer the in-app install for an available, non-forced update.
      // Forced updates are handled by ForcedUpdateGate; mdm/manual updates are
      // not installed from here; runtime_ok means we are already up to date.
      if (decision.state !== 'apk_available') return;

      const deliveryMode =
        decision.deliveryMode || decision.policy?.apk?.deliveryMode || 'in_app';
      if (!canOfferInAppInstall(deliveryMode)) return;

      const release = decision.currentApk;
      if (!release) return;

      // The Updates screen has its own install controls; don't double up.
      if (isUpdatesScreenFocused()) return;

      // Snooze check before any disk I/O: while a release is snoozed (the
      // common case after the user taps "Later") this bails after a single
      // cheap read instead of also hitting download state + the filesystem.
      const record = await readPromptRecord();
      if (record?.releaseId === release.apkReleaseId && Date.now() < record.until) {
        return;
      }

      const state = await getDownloadState();
      if (
        state?.status !== 'verified' ||
        state.apkReleaseId !== release.apkReleaseId ||
        !state.fileUri
      ) {
        return;
      }

      // Defence in depth: never prompt against a file that has been cleaned up.
      const info = await FileSystem.getInfoAsync(state.fileUri);
      if (!info.exists) return;

      const sessionActive =
        (await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE)) ===
        'true';
      if (
        !mounted ||
        sessionActive ||
        isUpdatesScreenFocused() ||
        AppState.currentState !== 'active'
      ) {
        return;
      }

      prompting.current = true;
      Alert.alert(
        updateCopy.apkReadyTitle(),
        updateCopy.apkReadyBody(release.versionName),
        [
          {
            text: updateCopy.later(),
            style: 'cancel',
            onPress: () => {
              snoozeRelease(release.apkReleaseId, SNOOZE_MS);
              prompting.current = false;
            },
          },
          {
            text: updateCopy.install(),
            onPress: () => {
              // Short snooze only: avoids an immediate re-prompt when returning
              // from the OS installer, but recovers quickly if it was blocked.
              snoozeRelease(release.apkReleaseId, INSTALL_RETRY_MS);
              installApkIfSafe(state.fileUri || '', release)
                .catch((e: any) => {
                  Alert.alert(
                    updateCopy.installBlockedTitle(),
                    updateCopy.installBlockedBody(e?.message),
                  );
                })
                .finally(() => {
                  prompting.current = false;
                });
            },
          },
        ],
        {
          cancelable: true,
          // Android hardware-back / tap-outside dismissal runs neither button,
          // so reset state here too or the prompt would wedge for the session.
          onDismiss: () => {
            snoozeRelease(release.apkReleaseId, SNOOZE_MS);
            prompting.current = false;
          },
        },
      );
    };

    check().catch(() => null);
    const interval = setInterval(() => check().catch(() => null), 30000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check().catch(() => null);
    });

    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [updateDecision]);

  return null;
}
