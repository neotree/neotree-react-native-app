import { validateMuid } from './muid';
import { looksLikeMuid } from './neotreeId';

/**
 * Which ID a session is saved with. The script's ID type decides the format; there is no separate key.
 *
 * Candidates are tried in the order the app has always used: the ID found by the NUID search (it wins),
 * then the one entered in the script's ID field. A candidate is only used if it fits the script:
 *
 *   muid  a valid MUID (any case, hyphen or not); it is used in its stored form, M0K7Q-000001R
 *   nuid  anything that isn't a MUID, as before, so older NUIDs are never newly rejected
 *
 * A session that already has an ID keeps it whatever its format, so a script switched from NUID to
 * MUID doesn't change the ID of a draft that is still open. With no usable candidate the generated ID
 * is used, unless the script needs the searched ID, in which case there is an error to act on.
 */
export type SessionUidInput = {
    idType: 'nuid' | 'muid';
    searchedUid?: string | null;
    entryUid?: string | null;
    /** The ID the session was already saved with (resuming or editing). */
    existingUid?: string | null;
    generatedUid?: string | null;
    /** The script takes its ID from the NUID search, so a generated one is not allowed. */
    requiresSearchedUid?: boolean;
};

function fits(candidate: string, idType: 'nuid' | 'muid'): string | null {
    if (idType === 'muid') {
        const v = validateMuid(candidate);
        return v.isValid ? v.stored : null;
    }
    return looksLikeMuid(candidate) ? null : candidate;
}

export function pickSessionUid(input: SessionUidInput): string {
    const { idType, searchedUid, entryUid, existingUid, generatedUid, requiresSearchedUid } = input;
    const existing = `${existingUid || ''}`.trim();
    const candidates = [searchedUid, entryUid].map(c => `${c || ''}`.trim()).filter(Boolean);

    for (const candidate of candidates) {
        if (candidate === existing) return candidate;
        const usable = fits(candidate, idType);
        if (usable) return usable;
    }

    if (existing) return existing;

    if (requiresSearchedUid) {
        if (candidates.length) {
            const kind = idType === 'muid' ? 'a MUID (like M0K7Q-000001R)' : 'a NUID (like FB8E-1230042)';
            throw new Error(`This script uses ${idType === 'muid' ? 'MUIDs' : 'NUIDs'}, but the Neotree ID found (${candidates[0]}) is not ${kind}. Please re-scan or re-enter the patient Neotree ID before continuing.`);
        }
        throw new Error('This session requires the searched Neotree ID, but no Neotree ID was found. Please re-scan or re-enter the patient Neotree ID before continuing.');
    }

    return `${generatedUid || ''}`;
}
