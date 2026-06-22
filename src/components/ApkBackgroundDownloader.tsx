import React from 'react';
import { AppState } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { useAppContext } from '@/src/AppContext';
import { driveApkBackgroundDownload, resetDownloadBackoff } from '@/src/update';

// Safety-net cadence. Reconnect and foreground are the primary triggers; this slow
// tick only covers the "still online but a retry window has since elapsed" case
// (e.g. a transient server error that did not flip connectivity). Kept long so an
// idle, up-to-date tablet does effectively no work.
const SAFETY_NET_INTERVAL_MS = 60 * 1000;

// Fleet-safe jitter. When a whole site's Wi-Fi returns, every tablet would resume
// its download at the same instant — a thundering herd on the APK endpoint and the
// download-token service. Spreading the reconnect resume across a random window
// turns that spike into a smooth ramp. Only the *connectivity transition* is
// jittered (it is the synchronised, fleet-wide event); per-device foreground and
// the slow safety-net tick are not.
const RECONNECT_JITTER_MS = 30 * 1000;

const isWifiLike = (state: NetInfoState | null) =>
  state?.type === 'wifi' || state?.type === 'ethernet';

/**
 * Headless controller that gives the APK update channel the same hands-off
 * behaviour clinicians already get from OTA: when an update is found it downloads
 * in the background, and when the internet drops mid-download it automatically
 * continues from where it left off the moment connectivity returns — no sync, no
 * tap. Once the file is downloaded and verified, ApkUpdateReadyPrompt surfaces the
 * familiar "update ready, install now?" prompt.
 *
 * It owns no UI and holds no heavy state; all progress/verification lives in the
 * download manager (persisted), so the work survives app restarts and this just
 * re-pokes the driver on the right signals.
 */
export function ApkBackgroundDownloader() {
  const { updateDecision } = useAppContext() || {};

  // Keep the latest decision in a ref so the long-lived listeners always act on
  // current data without being torn down and re-registered on every change.
  const decisionRef = React.useRef(updateDecision);
  decisionRef.current = updateDecision;

  const reconnectTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const drive = React.useCallback((opts?: { ignoreBackoff?: boolean }) => {
    const decision = decisionRef.current;
    if (!decision) return;
    driveApkBackgroundDownload(decision, opts).catch(() => null);
  }, []);

  // Whether the current network state permits a download for THIS policy. The
  // Wi-Fi-only gate is also enforced authoritatively inside the driver; this is
  // only used to decide when to *trigger* a resume (so a Wi-Fi-only download kicks
  // off the moment the tablet joins Wi-Fi, not just when it first comes online).
  const canDownloadNow = React.useCallback((state: NetInfoState | null) => {
    const online = Boolean(state?.isConnected) && state?.isInternetReachable !== false;
    if (!online) return false;
    const wifiOnly = !!decisionRef.current?.policy?.apk?.wifiOnly;
    return !wifiOnly || isWifiLike(state);
  }, []);

  // Re-evaluate immediately whenever a *new* target release (or auto-download
  // eligibility) appears, so a freshly published APK starts downloading at once.
  React.useEffect(() => {
    drive();
  }, [drive, updateDecision?.currentApk?.apkReleaseId, updateDecision?.shouldAutoDownload]);

  React.useEffect(() => {
    let lastCanDownload: boolean | null = null;

    const scheduleJitteredResume = () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      const delay = Math.floor(Math.random() * RECONNECT_JITTER_MS);
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null;
        // A returning/upgraded connection is a strong signal: reset the paced
        // backoff (also clears the retry timestamp) and resume from where we left
        // off. The jitter above keeps the fleet from resuming in lockstep.
        resetDownloadBackoff().catch(() => null);
        drive({ ignoreBackoff: true });
      }, delay);
    };

    const netUnsub = NetInfo.addEventListener((state) => {
      const can = canDownloadNow(state);
      if (lastCanDownload === null) {
        lastCanDownload = can;
        return;
      }
      // Fire on the transition into a downloadable state (offline→online, or
      // cellular→Wi-Fi when the policy is Wi-Fi-only).
      if (!lastCanDownload && can) scheduleJitteredResume();
      lastCanDownload = can;
    });

    const appSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') drive();
    });

    const interval = setInterval(() => drive(), SAFETY_NET_INTERVAL_MS);

    // Kick once on mount (e.g. app launched already online with an update pending).
    drive();

    return () => {
      netUnsub();
      appSub.remove();
      clearInterval(interval);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [drive, canDownloadNow]);

  return null;
}
