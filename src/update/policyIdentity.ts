import type { UpdatePolicy } from '../types';

export function getUpdatePolicyFingerprint(policy: UpdatePolicy) {
  return `${policy.policyVersion}:${policy.currentApkRelease?.apkReleaseId || 'no-apk'}`;
}
