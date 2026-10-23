/** Production merge that first persisted poll delivery acknowledgements. */
export const POLL_TRACKING_STARTED_AT = '2026-07-30T10:34:29.000Z';

function sessionTimestamp(session: any): number | null {
    for (const raw of [session?.createdAt, session?.data?.started_at]) {
        if (!raw) continue;
        const parsed = Date.parse(raw);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}

export function isLegacyPollSession(session: any): boolean {
    if (!session?.exported || session?.poll_exported) return false;
    const timestamp = sessionTimestamp(session);
    return timestamp !== null && timestamp < Date.parse(POLL_TRACKING_STARTED_AT);
}

export function pollDeliverySatisfied(session: any, pollRequired: boolean): boolean {
    return !pollRequired || Boolean(session?.poll_exported) || isLegacyPollSession(session);
}

export function exportAcknowledged(status: number | undefined): boolean {
    return status !== undefined && ((status >= 200 && status < 300) || status === 409);
}

export function retryableHttpStatus(status: number): boolean {
    return status === 408 || status === 425 || status === 429 || status >= 500;
}
