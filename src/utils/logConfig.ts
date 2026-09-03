import Constants, { ExecutionEnvironment } from 'expo-constants';

// Where a report goes: the console while you are building the app, a synced
// row once the app is actually built and installed.
//
// This deliberately does NOT key off NEOTREE_BUILD_TYPE. That variable selects
// which backend to talk to (development / demo / stage / production) and every
// one of those points at a remote server, so it says nothing about whether a
// human is sitting in front of Metro. Run `NEOTREE_BUILD_TYPE=stage expo start`
// to debug against stage data — a perfectly normal thing to do — and a
// build-type check would start posting your local errors to the stage server.
//
// `__DEV__` is the right signal and Expo sets it for free. It is true whenever
// the JS bundle was built in development mode — `expo start`, a dev client
// against Metro — and false in any release bundle produced by `eas build`.
// It follows the bundle, not the profile, which is exactly the distinction we
// want: am I developing this app right now, or is this a shipped build?

/** Running against Metro — i.e. someone is actively developing. */
const IS_DEVELOPING = __DEV__;

/**
 * A real, installed build. Expo Go is excluded explicitly: it is never a
 * "fully built app", so it must not post to a remote server even on the
 * off chance it is running a release bundle.
 */
const IS_BUILT_APP =
    !IS_DEVELOPING && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// Escape hatch: set to true to exercise the record → drain → sync path while
// developing. Off by default so local noise never reaches a server.
const PERSIST_WHILE_DEVELOPING = false;

/** Print reports to the console. While developing only; never in a built app. */
export const LOG_TO_CONSOLE = IS_DEVELOPING;

/** Record reports for syncing. Only a fully built app reports to our servers. */
export const PERSIST_REPORTS = IS_BUILT_APP || PERSIST_WHILE_DEVELOPING;
