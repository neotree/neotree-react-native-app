import {
    attemptAutoInstallIfDeferred,
    attemptAutoRetryDownload,
    cleanupApkDir,
    clearDownloadState,
    ensureApkDownloaded,
} from "./apkDownloadManager";
import { getUpdateDecision, type UpdateDecision } from "./orchestrator";

export const applyUpdateFlowAfterSync = async (): Promise<UpdateDecision> => {
    const decision = await getUpdateDecision();

    await attemptAutoInstallIfDeferred();
    attemptAutoRetryDownload(decision).catch(() => null);

    if (decision?.shouldAutoDownload) {
        ensureApkDownloaded(decision).catch(() => null);
    } else if (decision?.state === "runtime_ok") {
        // Tablet is up to date: drop any leftover APK file *and* its download
        // state so a stale `verified` record can't re-trigger install prompts.
        cleanupApkDir(null).catch(() => null);
        clearDownloadState().catch(() => null);
    }

    return decision;
};

export const tryApplyUpdateFlowAfterSync =
    async (): Promise<UpdateDecision | null> => {
        try {
            return await applyUpdateFlowAfterSync();
        } catch (e) {
            console.log("applyUpdateFlowAfterSync", e);
            return null;
        }
    };
