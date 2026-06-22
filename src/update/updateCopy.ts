// Single source of truth for user-facing update copy. Centralising the strings as
// functions makes them consistent across the banner / prompts / Updates screen and
// localization-ready: swapping in an i18n layer later means changing only this file
// (each entry is already a pure function of its inputs, not an inline literal).

export const updateCopy = {
  apkReadyTitle: () => 'App update ready',
  apkReadyBody: (versionName?: string | null) =>
    `NeoTree has downloaded version ${versionName || 'the latest update'}. Install it now?`,
  install: () => 'Install',
  later: () => 'Later',
  installBlockedTitle: () => 'Install blocked',
  installBlockedBody: (message?: string | null) =>
    message || 'NeoTree could not open the installer.',

  // Wi-Fi-only / metered (#2)
  waitingForWifi: () => 'Waiting for Wi-Fi to download this update (Wi-Fi-only is enabled).',
  meteredBadge: () => 'Wi-Fi only',

  // Status labels reused by the banner.
  updateAvailable: () => 'App update available',
  requiredUpdate: () => 'Required app update',
  adminManagedUpdate: () => 'Administrator managed update',
  adminHelpNeeded: () => 'Administrator help needed',
} as const;

export type UpdateCopy = typeof updateCopy;
