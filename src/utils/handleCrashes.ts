import { dbTransaction } from '../data/db';
import { getLocation } from '../data/queries';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery'
import { getAvailableDiskSpace } from './deviceInfo';
import { getBreadcrumbs } from './breadcrumbs';
import { redactMessage, scrubExtra } from './scrub';
import type { ErrorSource, ErrorLevel } from './logError';
import { PERSIST_REPORTS } from './logConfig';

// Guard rails on what gets written into a synced row: a runaway stack (an
// infinite recursion, a serialised response body) would otherwise be POSTed
// verbatim on the next sync.
const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 4000;
const MAX_BREADCRUMBS_LENGTH = 4000;
const APPLICATION_CACHE_TTL = 60_000;
let applicationCache: { value: any; expires: number } | null = null;

// Manufacturer, model and OS cannot change while the app is running.
let deviceTypeCache: number | null | undefined;

export function safeStringify(value: any): string {
    try {
        return JSON.stringify(value);
    } catch {
        // Circular references, BigInt, and getters that throw all land here.
        // Fall back to the shape of the value, which is still worth having.
        try {
            return `{${Object.keys(value).join(',')}}`;
        } catch {
            return '[unserialisable]';
        }
    }
}

// Anything can be thrown in JS, not just an Error. Normalise whatever we were
// handed into the { message, stack } shape the exceptions table stores, so a
// thrown string or a rejected plain object still produces a usable row.
export function normaliseError(error: any): { message: string; stack: string } {
    try {
        if (error instanceof Error) {
            return { message: error.message || String(error), stack: error.stack || '' };
        }
        if (typeof error === 'string') return { message: error, stack: '' };
        if (error && typeof error === 'object') {
            const message = error.message ?? error.error ?? safeStringify(error);
            return { message: String(message), stack: String(error.stack || '') };
        }
        return { message: String(error), stack: '' };
    } catch {
        // A getter on the thrown value threw, or it has a poisoned toString.
        // Record that something failed rather than losing the report entirely.
        return { message: 'Unserialisable error value', stack: '' };
    }
}

// Each of these can fail independently — expo-battery is unavailable on some
// devices, and the location/disk lookups hit the DB and filesystem — so they
// resolve to null rather than aborting the whole recording.
async function settled<T>(promise: Promise<T>): Promise<T | null> {
    try {
        return await promise;
    } catch {
        return null;
    }
}

async function getApplication(): Promise<any> {
    const now = Date.now();
    if (applicationCache && applicationCache.expires > now) return applicationCache.value;
    const rows = await dbTransaction('select * from application where id=1;');
    const value = rows?.[0] ?? null;
    applicationCache = { value, expires: now + APPLICATION_CACHE_TTL };
    return value;
}

// ---------------------------------------------------------------------------
// Occurrence counting
//
// A fault inside a render loop can fire thousands of times. Writing a row each
// time would hammer SQLite, and recording it once (the old behaviour) threw
// away the single most useful signal: how often. So the first occurrence in a
// session touches the DB, and every repeat after that is a Map lookup and an
// increment — no I/O at all. The tally is flushed to the row at sync time.
// ---------------------------------------------------------------------------

type PendingCount = {
    message: string;
    source: ErrorSource;
    count: number;
    lastSeen: string;
};

const seenThisSession = new Set<string>();
const pendingCounts = new Map<string, PendingCount>();

function countKey(message: string, source: ErrorSource) {
    return `${source}|${message}`;
}

function recordOccurrence(key: string, message: string, source: ErrorSource) {
    const existing = pendingCounts.get(key);
    if (existing) {
        existing.count += 1;
        existing.lastSeen = new Date().toISOString();
        return;
    }
    pendingCounts.set(key, { message, source, count: 1, lastSeen: new Date().toISOString() });
}

/**
 * Write accumulated repeat counts back to their rows. Called by syncData before
 * the drain, so the server sees an up-to-date occurrence total.
 *
 * A row whose count changed is marked undelivered again so the new total is
 * sent. Never throws.
 */
export async function flushOccurrenceCounts(): Promise<void> {
    if (!pendingCounts.size) return;
    const batch = [...pendingCounts.values()];
    pendingCounts.clear();

    for (const entry of batch) {
        try {
            await dbTransaction(
                `update exceptions
                    set occurrences = occurrences + ?, last_seen = ?, exported = 0, editor_exported = 0
                  where message = ? and source = ?;`,
                [entry.count, entry.lastSeen, entry.message, entry.source],
            );
        } catch {
            // Losing a count is acceptable; failing a sync over one is not.
        }
    }
}

export async function handleAppCrush(
    error: any,
    source: ErrorSource = 'app',
    level: ErrorLevel = 'error',
    extra?: Record<string, unknown>,
) {
    // Gated here rather than in logError so every path is covered, including
    // the error boundary in App.tsx which calls this directly.
    if (!PERSIST_REPORTS) return;

    try {
        const { message: rawMessage, stack: rawStack } = normaliseError(error);
        // Redacting varying tokens does double duty: it strips the most likely
        // place for an identifier to leak, and it makes the message stable
        // enough that two instances of one fault dedupe together.
        const message = redactMessage(rawMessage).slice(0, MAX_MESSAGE_LENGTH);
        const stack = rawStack.slice(0, MAX_STACK_LENGTH);

        // Nothing identifiable to record, and nothing to dedupe on.
        if (!message) return;

        const key = countKey(message, source);

        // The hot path: a fault already seen this session costs one Set lookup
        // and one Map increment. No SQLite, no native calls.
        if (seenThisSession.has(key)) {
            recordOccurrence(key, message, source);
            return;
        }
        seenThisSession.add(key);

        const application = await getApplication();
        if (!application) {
            // Before the first sync there is no row to attach a report to. Let
            // it be recorded again later rather than swallowing it forever.
            seenThisSession.delete(key);
            return;
        }

        // The row may already exist from an earlier session; count against it
        // instead of inserting a duplicate.
        const alreadyLogged = await dbTransaction(
            'select id from exceptions where message=? and source=?;',
            [message, source],
        );
        if (alreadyLogged?.length) {
            recordOccurrence(key, message, source);
            return;
        }

        let webApp: any = null;
        try {
            webApp = JSON.parse(application?.webeditor_info);
        } catch {
            // webeditor_info is absent or malformed before the first sync.
        }

        if (deviceTypeCache === undefined) {
            deviceTypeCache = await settled(Device.getDeviceTypeAsync());
        }

        const [batteryLevel, location, diskSpace] = await Promise.all([
            settled(Battery.getBatteryLevelAsync()),
            settled(getLocation()),
            settled(getAvailableDiskSpace()),
        ]);

        const deviceType = deviceTypeCache === 2 ? 'TABLET' : 'PHONE';
        const battery = typeof batteryLevel === 'number' ? (batteryLevel * 100).toPrecision(2) : null;
        // Kept as-is for the existing backend contract; the structured columns
        // below are what makes the data actually queryable.
        const model = 'MANUFACTURER: ' + Device.manufacturer + ' MODEL :' + Device.modelName + ' TYPE: ' + deviceType + ' OS VERSION: ' + Device.osVersion;
        const memory = diskSpace
            ? 'AVAILABLE STORAGE:' + diskSpace.freeSpace + ' GB' + ' OF ' + diskSpace.totalSpace + 'GB'
            : null;

        const breadcrumbs = safeStringify(getBreadcrumbs()).slice(0, MAX_BREADCRUMBS_LENGTH);
        const context = extra ? safeStringify(scrubExtra(extra)) : null;
        const now = new Date().toISOString();

        const columns = [
            'message', 'stack', 'device', 'source', 'level', 'exported', 'editor_exported',
            'country', 'hospital', 'version', 'editor_version', 'battery', 'memory', 'device_model',
            'manufacturer', 'device_name', 'device_type', 'os_version',
            'free_storage_gb', 'total_storage_gb',
            'occurrences', 'first_seen', 'last_seen', 'breadcrumbs', 'context',
        ];
        const placeholders = columns.map(() => '?').join(',');

        await dbTransaction(`insert into exceptions (${columns.join(',')}) values (${placeholders});`, [
            message,
            stack,
            application.device_id,
            source,
            level,
            false,
            false,
            location?.country,
            location?.hospital,
            application?.version,
            webApp?.version,
            battery,
            memory,
            model,
            Device.manufacturer,
            Device.modelName,
            deviceType,
            Device.osVersion,
            diskSpace?.freeSpace ?? null,
            diskSpace?.totalSpace ?? null,
            1,
            now,
            now,
            breadcrumbs,
            context,
        ]);
    } catch {
        // Reporting must never throw: callers are fire-and-forget, and there
        // is nowhere left to report a failure of the reporter itself.
    }
}
