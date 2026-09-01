// Redaction for anything that leaves the device in an error report.
//
// This is a clinical app. An exception row is POSTed to nodeapi and the
// webeditor, so a `extra` payload that innocently carries a script entry, a
// patient uid or a form value would be exfiltrating PHI. Callers should not
// have to remember that, so everything is scrubbed here on the way out.

// Keys whose values are never sent. Anchored to the whole key (with an optional
// prefix) so useful metadata survives: `fieldKey` is not caught by `key`,
// `sessionId` is not caught by `session`, `scriptTitle` is not caught by `title`.
const SENSITIVE_KEY = /^([a-z0-9]*_)?(value|valuetext|valuelabel|values|label|labels|answer|answers|entry|entries|record|records|session|patient|name|firstname|lastname|surname|fullname|dob|birth|birthdate|age|address|phone|mobile|contact|email|uid|nuid|nrc|passport|guardian|mother|father|caregiver|token|secret|password|auth|apikey|gps|lat|lng|latitude|longitude|coords)$/i;

const REDACTED = '[redacted]';

// A long free-text value is far more likely to be clinical data than a useful
// diagnostic, so values are capped rather than sent whole.
const MAX_STRING = 64;
const MAX_ARRAY = 20;
const MAX_KEYS = 25;

function scrubString(value: string): string {
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…(${value.length})` : value;
}

function scrubValue(value: unknown, depth: number): unknown {
    if (value === null || value === undefined) return value ?? null;

    const type = typeof value;
    if (type === 'number' || type === 'boolean') return value;
    if (type === 'string') return scrubString(value as string);
    if (type === 'bigint' || type === 'symbol' || type === 'function') return `[${type}]`;

    if (Array.isArray(value)) {
        // Depth is capped so a nested session object can't be walked into.
        if (depth >= 1) return `[array(${value.length})]`;
        const items = value.slice(0, MAX_ARRAY).map(v => scrubValue(v, depth + 1));
        return value.length > MAX_ARRAY ? [...items, `…(${value.length} total)`] : items;
    }

    if (type === 'object') {
        if (depth >= 1) return '[object]';
        return scrubObject(value as Record<string, unknown>, depth + 1);
    }

    return `[${type}]`;
}

function scrubObject(input: Record<string, unknown>, depth: number): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    let keys: string[];
    try {
        keys = Object.keys(input);
    } catch {
        return { scrubError: 'unreadable object' };
    }

    for (const key of keys.slice(0, MAX_KEYS)) {
        if (SENSITIVE_KEY.test(key)) {
            out[key] = REDACTED;
            continue;
        }
        try {
            out[key] = scrubValue(input[key], depth);
        } catch {
            // A getter that throws.
            out[key] = '[unreadable]';
        }
    }
    if (keys.length > MAX_KEYS) out['…'] = `${keys.length - MAX_KEYS} more keys`;
    return out;
}

/** Scrub a diagnostic payload before it is recorded and synced. */
export function scrubExtra(extra: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!extra) return undefined;
    try {
        const scrubbed = scrubObject(extra, 0);
        return Object.keys(scrubbed).length ? scrubbed : undefined;
    } catch {
        return { scrubError: 'payload could not be scrubbed' };
    }
}

// Varying tokens inside an error message serve double duty: they are the most
// likely place for an identifier to leak, and they are what stops two instances
// of the same fault from deduping together. Replacing them fixes both at once.
const VARYING = [
    [/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]'],
    [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[uuid]'],
    [/\b[0-9a-f]{16,}\b/gi, '[hex]'],
    [/\d{6,}/g, '[num]'],
] as const;

/** Normalise a message so it is both safe to send and stable enough to dedupe. */
export function redactMessage(message: string): string {
    try {
        return VARYING.reduce<string>((acc, [pattern, replacement]) => acc.replace(pattern, replacement), message);
    } catch {
        return message;
    }
}

/** Strip the query string from a URL — it carries uid and unique_key. */
export function scrubUrl(url: string): string {
    try {
        return url.split('?')[0];
    } catch {
        return '[url]';
    }
}
