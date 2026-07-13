import { InteractionManager } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { exportSessions } from './exportSessions';

let unsubscribe: (() => void) | null = null;
let wasOnline: boolean | null = null;
let flushPending = false;

/**
 * Runs completely silently: waits for any in-progress animations/gestures
 * before doing work, swallows every error, and never touches the UI. At most
 * one flush is pending at a time, so a flapping network can't pile up runs.
 */
function queueSilentFlush() {
    if (flushPending) return;
    flushPending = true;

    InteractionManager.runAfterInteractions(() => {
        const clear = () => { flushPending = false; };
        exportSessions().then(clear, clear);
    });
}

/**
 * Flushes unexported sessions as soon as connectivity is restored, so sessions
 * completed offline don't wait for the next session save or a manual export.
 * Safe to call more than once — only one listener is ever registered, and
 * overlapping flushes are serialized by the export lock.
 */
export function registerExportOnReconnect() {
    if (unsubscribe) return unsubscribe;

    const removeListener = NetInfo.addEventListener(state => {
        const online = Boolean(state.isConnected && state.isInternetReachable);
        const cameBackOnline = wasOnline === false && online;
        wasOnline = online;

        if (cameBackOnline) queueSilentFlush();
    });

    unsubscribe = () => {
        removeListener();
        unsubscribe = null;
        wasOnline = null;
    };

    return unsubscribe;
}
