// Tracks whether the in-app Updates screen is currently focused. The Updates
// screen already shows its own install affordance (ApkUpdateBanner / primary
// button), so the global ApkUpdateReadyPrompt suppresses itself while the user
// is on that screen to avoid a redundant Alert popping over the same controls.
// A module-level flag keeps this in-memory and avoids any AsyncStorage I/O.

let focused = false;

export const setUpdatesScreenFocused = (value: boolean) => {
    focused = value;
};

export const isUpdatesScreenFocused = () => focused;
