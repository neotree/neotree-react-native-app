import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { pollDeliverySatisfied } from './deliveryRules';

export { isLegacyPollSession, POLL_TRACKING_STARTED_AT } from './deliveryRules';

/**
 * Poll delivery was first tracked by the client in the production merge below.
 * Older rows have poll_exported=0 only because SQLite populated the newly-added
 * column with its default; that value is not evidence that their poll export
 * failed. Keep the boundary explicit so legacy data is never silently replayed.
 */
export function pollingRequired(country: string | null | undefined): boolean {
    if (!country) return false;
    return (APP_CONFIG[country] as types.COUNTRY_CONFIG | undefined)?.savePollingData === true;
}

export function getPollingCountries(): string[] {
    return Object.keys(APP_CONFIG || {}).filter(country => pollingRequired(country));
}

export function isTerminalSession(session: any): boolean {
    return Boolean(session?.data?.completed_at || session?.data?.canceled_at);
}

export function isExportableSession(session: any): boolean {
    return Boolean(session?.data?.completed_at && !session?.data?.canceled_at);
}

export function isPollDelivered(session: any): boolean {
    return pollDeliverySatisfied(session, pollingRequired(session?.data?.country));
}

export function isRemoteDelivered(session: any): boolean {
    return isExportableSession(session)
        && Boolean(session?.exported)
        && isPollDelivered(session);
}

export function localRequiredForSession(
    session: any,
    location: { country?: string | null; hospital?: string | null } | null | undefined,
    hasLocalConfig: boolean,
): boolean {
    if (!hasLocalConfig || !location?.country || !location?.hospital) return false;
    return session?.data?.country === location.country
        && session?.data?.hospital_id?.trim?.() === location.hospital.trim();
}

export function isFullyDelivered(
    session: any,
    location: { country?: string | null; hospital?: string | null } | null | undefined,
    hasLocalConfig: boolean,
): boolean {
    if (!session) return false;
    if (session?.data?.canceled_at && !isExportableSession(session)) return true;
    if (!isRemoteDelivered(session)) return false;
    if (localRequiredForSession(session, location, hasLocalConfig) && !session.local_export) return false;
    return true;
}
