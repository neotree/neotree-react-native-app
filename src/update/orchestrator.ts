import type { UpdatePolicy, UpdatePolicyApkRelease } from '@/src/types';
import { getUpdatePolicyData } from '@/src/data/queries';
import {
  detectInstalledApkRelease,
  getAppRuntimeIdentity,
  isReleaseInstalled,
  type AppRuntimeIdentity,
  type InstalledApkRelease,
} from './appIdentity';

export type UpdateDecisionState =
  | 'policy_missing'
  | 'runtime_ok'
  | 'runtime_mismatch_unmanaged'
  | 'mdm_managed'
  | 'manual_update_required'
  | 'apk_available'
  | 'apk_forced';

export type UpdateDecision = {
  state: UpdateDecisionState;
  runtimeVersion: string | null;
  policyRuntimeVersion: string | null;
  policy?: UpdatePolicy | null;
  currentApk?: UpdatePolicyApkRelease | null;
  installedApk?: InstalledApkRelease | null;
  shouldAutoDownload: boolean;
  shouldForceInstall: boolean;
  deliveryMode?: string | null;
  managedByMdm?: boolean;
  forceAfter?: string | null;
  blockedReason?: string | null;
  reason?: string;
};

const isForceWindowActive = (forceAfter?: string | null) => {
  if (!forceAfter) return true;
  const t = new Date(forceAfter).getTime();
  return !Number.isNaN(t) && Date.now() >= t;
};

const isAvailableRelease = (release?: UpdatePolicyApkRelease | null) =>
  !!(release?.available && release?.isAvailable);

const getTargetRelease = (policy: UpdatePolicy) => {
  const current = policy.currentApkRelease || null;
  const rollback = policy.rollbackApkRelease || null;
  if (isAvailableRelease(current) && current?.status !== 'revoked') return current;
  if (isAvailableRelease(rollback)) return rollback;
  return current;
};

const shouldInstallRelease = (
  release: UpdatePolicyApkRelease | null,
  installedApk: InstalledApkRelease | null,
  identity: AppRuntimeIdentity,
) => {
  if (!isAvailableRelease(release)) return false;
  if (installedApk?.apkReleaseId && installedApk.apkReleaseId === release?.apkReleaseId) return false;
  if (isReleaseInstalled(release, identity)) return false;
  if (release?.isDowngrade) return false;

  const nativeBuildVersion = Number(identity.nativeBuildVersion);
  if (Number.isFinite(nativeBuildVersion) && release && release.versionCode < nativeBuildVersion) return false;
  if (Number.isFinite(nativeBuildVersion) && release && release.versionCode > nativeBuildVersion) return true;
  if (release?.runtimeVersion && identity.runtimeVersion && release.runtimeVersion !== identity.runtimeVersion) return true;
  if (release?.versionName && identity.appVersion !== release.versionName) return true;

  return !identity.runtimeVersion || !identity.appVersion;
};

const getBlockedReason = (release: UpdatePolicyApkRelease | null, identity: AppRuntimeIdentity) => {
  if (release?.isDowngrade) {
    return 'Target APK versionCode is lower than the installed build; Android blocks downgrade installs';
  }
  const nativeBuildVersion = Number(identity.nativeBuildVersion);
  if (Number.isFinite(nativeBuildVersion) && release && release.versionCode < nativeBuildVersion) {
    return 'Target APK versionCode is lower than the installed build; Android blocks downgrade installs';
  }
  return null;
};

export function evaluateUpdatePolicy(
  policy: UpdatePolicy | null,
  runtimeVersion?: string | null,
  installedApk?: InstalledApkRelease | null,
  identity: AppRuntimeIdentity = getAppRuntimeIdentity(),
): UpdateDecision {
  const runtime = runtimeVersion ?? identity.runtimeVersion;

  if (!policy) {
    return {
      state: 'policy_missing',
      runtimeVersion: runtime,
      policyRuntimeVersion: null,
      installedApk,
      shouldAutoDownload: false,
      shouldForceInstall: false,
      reason: 'No update policy stored',
    };
  }

  const policyRuntime = policy.runtimeVersion || null;
  const currentApk = getTargetRelease(policy);
  const needsApkInstall = shouldInstallRelease(currentApk, installedApk || null, identity);
  const blockedReason = getBlockedReason(currentApk, identity);
  const deliveryMode = policy.apk?.deliveryMode || 'in_app';
  const managedByMdm = deliveryMode === 'mdm' || deliveryMode === 'hybrid';
  const allowsInAppDownload = deliveryMode === 'in_app' || deliveryMode === 'hybrid';
  const shouldAutoDownload = !!(allowsInAppDownload && policy.apk?.autoDownload && needsApkInstall);
  const shouldForceInstall = !!(
    allowsInAppDownload &&
    policy.apk?.forceInstall &&
    needsApkInstall &&
    isForceWindowActive(policy.apk?.forceAfter || null)
  );

  if (!needsApkInstall && runtime && policyRuntime && `${runtime}` === `${policyRuntime}`) {
    return {
      state: 'runtime_ok',
      runtimeVersion: runtime,
      policyRuntimeVersion: policyRuntime,
      policy,
      currentApk,
      installedApk,
      shouldAutoDownload: false,
      shouldForceInstall: false,
      deliveryMode,
      managedByMdm,
      blockedReason,
    };
  }

  if (needsApkInstall) {
    if (deliveryMode === 'mdm') {
      return {
        state: 'mdm_managed',
        runtimeVersion: runtime,
        policyRuntimeVersion: policyRuntime,
        policy,
        currentApk,
        installedApk,
        shouldAutoDownload: false,
        shouldForceInstall: false,
        deliveryMode,
        managedByMdm: true,
        forceAfter: policy.apk?.forceAfter || null,
        blockedReason: null,
        reason: 'This update is managed by MDM',
      };
    }

    if (deliveryMode === 'manual') {
      return {
        state: 'manual_update_required',
        runtimeVersion: runtime,
        policyRuntimeVersion: policyRuntime,
        policy,
        currentApk,
        installedApk,
        shouldAutoDownload: false,
        shouldForceInstall: false,
        deliveryMode,
        managedByMdm: false,
        forceAfter: policy.apk?.forceAfter || null,
        blockedReason: null,
        reason: 'Manual update required',
      };
    }

    return {
      state: shouldForceInstall ? 'apk_forced' : 'apk_available',
      runtimeVersion: runtime,
      policyRuntimeVersion: policyRuntime,
      policy,
      currentApk,
      installedApk,
      shouldAutoDownload,
      shouldForceInstall,
      deliveryMode,
      managedByMdm,
      forceAfter: policy.apk?.forceAfter || null,
      blockedReason: null,
    };
  }

  return {
    state: 'runtime_mismatch_unmanaged',
    runtimeVersion: runtime,
    policyRuntimeVersion: policyRuntime,
    policy,
    currentApk,
    installedApk,
    shouldAutoDownload: false,
    shouldForceInstall: false,
    deliveryMode,
    managedByMdm,
    blockedReason,
    reason: blockedReason || 'Runtime mismatch with no available APK',
  };
}

export async function getUpdateDecision(): Promise<UpdateDecision> {
  const policy = await getUpdatePolicyData();
  const identity = getAppRuntimeIdentity();
  const installedApk = await detectInstalledApkRelease(policy);
  return evaluateUpdatePolicy(policy, identity.runtimeVersion, installedApk, identity);
}
