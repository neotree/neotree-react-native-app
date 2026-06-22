// Pure decision for the unattended APK background downloader. Deliberately kept
// free of any filesystem / network / native-module imports so the offline-first
// branching can be unit tested in isolation (mirrors versioning.ts / policyIdentity.ts).

export type BackgroundDownloadAction = 'skip' | 'verified' | 'in_progress' | 'paused' | 'blocked_metered' | 'deferred' | 'download';

type DecisionInput = {
  currentApk?: { apkReleaseId: string } | null;
  shouldAutoDownload?: boolean;
};

type DownloadStateInput = {
  apkReleaseId?: string;
  status?: string;
  fileUri?: string | null;
};

export function decideBackgroundDownloadAction(args: {
  decision: DecisionInput | null | undefined;
  state: DownloadStateInput | null | undefined;
  activeReleaseId: string | null;
  retryReady: boolean;
  ignoreBackoff?: boolean;
  /** True when the policy is Wi-Fi-only and the current connection is metered. */
  meteredBlocked?: boolean;
}): BackgroundDownloadAction {
  const release = args.decision?.currentApk;
  // Respect the administrator policy: only auto-download when the policy enables
  // it for an in-app/hybrid delivery that this tablet actually needs (encoded by
  // the orchestrator in `shouldAutoDownload`).
  if (!release || !args.decision?.shouldAutoDownload) return 'skip';
  // Already hold the verified file for this exact release — nothing to do.
  if (
    args.state?.apkReleaseId === release.apkReleaseId &&
    args.state?.status === 'verified' &&
    args.state?.fileUri
  ) {
    return 'verified';
  }
  // A download for this release is already running in this JS context — let it
  // finish even if the connection has since become metered (don't waste partial
  // bytes); the Wi-Fi-only gate only blocks *starting* a new download.
  if (args.activeReleaseId === release.apkReleaseId) return 'in_progress';
  // Explicit user pause: never auto-resume it. Only a manual Resume (which calls
  // the download path directly) restarts it. A reconnect must NOT override this,
  // so the check sits above the backoff/connectivity branches.
  if (args.state?.apkReleaseId === release.apkReleaseId && args.state?.status === 'paused') return 'paused';
  // Wi-Fi-only policy + metered/cellular connection: hold until Wi-Fi returns.
  if (args.meteredBlocked) return 'blocked_metered';
  // Pace "online but failing" retries unless a strong signal (reconnect) overrides.
  if (!args.ignoreBackoff && !args.retryReady) return 'deferred';
  return 'download';
}
