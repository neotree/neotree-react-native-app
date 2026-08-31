import { dbTransaction } from '../data/db';
import { getLocation } from '../data/queries';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery'
import { getAvailableDiskSpace } from './deviceInfo';

// Guard rails on what gets written into a synced row: a runaway stack (an
// infinite recursion, a serialised response body) would otherwise be POSTed
// verbatim on the next sync.
const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 4000;

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

export async function handleAppCrush(error: any) {
    try {
        const { message: rawMessage, stack: rawStack } = normaliseError(error);
        const message = rawMessage.slice(0, MAX_MESSAGE_LENGTH);
        const stack = rawStack.slice(0, MAX_STACK_LENGTH);

        // Nothing identifiable to record, and nothing to dedupe on.
        if (!message) return;

        const app = await dbTransaction('select * from application where id=1;');
        const application = app?.[0];
        if (!application) return;

        // Dedupe on the message so a fault that repeats every render records
        // one row instead of filling the table. Parameterised: messages
        // routinely contain apostrophes ("Can't reach the server"), which
        // would break an interpolated query.
        const alreadyLogged = await dbTransaction('select id from exceptions where message=?;', [message]);
        if (alreadyLogged?.length) return;

        let webApp: any = null;
        try {
            webApp = JSON.parse(application?.webeditor_info);
        } catch {
            // webeditor_info is absent or malformed before the first sync.
        }

        const [deviceTypeCode, batteryLevel, location, diskSpace] = await Promise.all([
            settled(Device.getDeviceTypeAsync()),
            settled(Battery.getBatteryLevelAsync()),
            settled(getLocation()),
            settled(getAvailableDiskSpace()),
        ]);

        const deviceType = deviceTypeCode === 2 ? 'TABLET' : 'PHONE';
        const battery = typeof batteryLevel === 'number' ? (batteryLevel * 100).toPrecision(2) : null;
        const model = 'MANUFACTURER: ' + Device.manufacturer + ' MODEL :' + Device.modelName + ' TYPE: ' + deviceType + ' OS VERSION: ' + Device.osVersion;
        const memory = diskSpace
            ? 'AVAILABLE STORAGE:' + diskSpace.freeSpace + ' GB' + ' OF ' + diskSpace.totalSpace + 'GB'
            : null;

        const columns = ['message', 'stack', 'device', 'exported', 'country', 'hospital', 'version', 'editor_version', 'battery', 'memory', 'device_model'].join(',');
        const values = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'].join(',');

        await dbTransaction(`insert into exceptions (${columns}) values (${values});`, [
            message,
            stack,
            application.device_id,
            false,
            location?.country,
            location?.hospital,
            application?.version,
            webApp?.version,
            battery,
            memory,
            model,
        ]);
    } catch {
        // Reporting must never throw: callers are fire-and-forget, and there
        // is nowhere left to report a failure of the reporter itself.
    }
}
