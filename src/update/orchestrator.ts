import Constants from 'expo-constants';

import type { UpdatePolicy, UpdatePolicyApkRelease } from '@/src/types';
import { getUpdatePolicyData } from '@/src/data/queries';

export type UpdateDecisionState =
  | 'policy_missing'
  | 'runtime_ok'
  | 'runtime_mismatch_unmanaged'
  | 'apk_available'
  | 'apk_forced';

export type UpdateDecision = {
  state: UpdateDecisionState;
  runtimeVersion: string | null;
  policyRuntimeVersion: string | null;
  policy?: UpdatePolicy | null;
  currentApk?: UpdatePolicyApkRelease | null;
  shouldAutoDownload: boolean;
  shouldForceInstall: boolean;
  forceAfter?: string | null;
  reason?: string;
};

const getRuntimeVersion = () =>
  (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || null;

const isForceWindowActive = (forceAfter?: string | null) => {
  if (!forceAfter) return true;
  const t = new Date(forceAfter).getTime();
  return !Number.isNaN(t) && Date.now() >= t;
};

export function evaluateUpdatePolicy(policy: UpdatePolicy | null, runtimeVersion?: string | null): UpdateDecision {
  const runtime = runtimeVersion ?? getRuntimeVersion();

  if (!policy) {
    return {
      state: 'policy_missing',
      runtimeVersion: runtime,
      policyRuntimeVersion: null,
      shouldAutoDownload: false,
      shouldForceInstall: false,
      reason: 'No update policy stored',
    };
  }

  const policyRuntime = policy.runtimeVersion || null;
  const currentApk = policy.currentApkRelease || null;
  const availableApk = !!(currentApk?.available && currentApk?.isAvailable);
  const shouldAutoDownload = !!(policy.apk?.autoDownload && availableApk);
  const shouldForceInstall = !!(
    policy.apk?.forceInstall &&
    availableApk &&
    isForceWindowActive(policy.apk?.forceAfter || null)
  );

  if (runtime && policyRuntime && `${runtime}` === `${policyRuntime}`) {
    return {
      state: 'runtime_ok',
      runtimeVersion: runtime,
      policyRuntimeVersion: policyRuntime,
      policy,
      currentApk,
      shouldAutoDownload: false,
      shouldForceInstall: false,
    };
  }

  if (availableApk) {
    return {
      state: shouldForceInstall ? 'apk_forced' : 'apk_available',
      runtimeVersion: runtime,
      policyRuntimeVersion: policyRuntime,
      policy,
      currentApk,
      shouldAutoDownload,
      shouldForceInstall,
      forceAfter: policy.apk?.forceAfter || null,
    };
  }

  return {
    state: 'runtime_mismatch_unmanaged',
    runtimeVersion: runtime,
    policyRuntimeVersion: policyRuntime,
    policy,
    currentApk,
    shouldAutoDownload: false,
    shouldForceInstall: false,
    reason: 'Runtime mismatch with no available APK',
  };
}

export async function getUpdateDecision(): Promise<UpdateDecision> {
  const policy = await getUpdatePolicyData();
  const runtimeVersion = getRuntimeVersion();
  return evaluateUpdatePolicy(policy, runtimeVersion);
}
