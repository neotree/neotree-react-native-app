/**
 * What a NUID search field does, from the role set on the NUID Search page in
 * the editor (neotree-editor lib/nuid-search/fields.ts, NUID_SEARCH_ROLES).
 *
 * A field without a role keeps the behaviour it had before roles existed, which
 * was worked out from its key and label. That fallback is reproduced exactly, so
 * scripts published before roles behave as they always have.
 */

export type NuidSearchRole = 'patient' | 'transfer' | 'twin' | 'lookup';

export type NuidSearchFieldLike = {
    key?: string | null;
    label?: string | null;
    type?: string | null;
    searchRole?: string | null;
};

export type NuidSearchBehaviour = {
    /** Sets the matched session (continue an existing one) and offers the BID/StillBirth start. */
    isPrimarySearch: boolean;
    /** Twin wording, twin pre-population; never supplies the session's Neotree ID. */
    isTwinSearch: boolean;
    /** The Neotree ID it finds becomes the session's. */
    suppliesSessionUid: boolean;
    /** Checked first when filling NUID_ fields with the patient's Neotree ID. */
    isPreferredPatientId: boolean;
};

const ROLE_BEHAVIOUR: Record<NuidSearchRole, NuidSearchBehaviour> = {
    patient: { isPrimarySearch: true, isTwinSearch: false, suppliesSessionUid: true, isPreferredPatientId: true },
    transfer: { isPrimarySearch: false, isTwinSearch: false, suppliesSessionUid: true, isPreferredPatientId: true },
    twin: { isPrimarySearch: false, isTwinSearch: true, suppliesSessionUid: false, isPreferredPatientId: false },
    lookup: { isPrimarySearch: false, isTwinSearch: false, suppliesSessionUid: false, isPreferredPatientId: false },
};

export function isNuidSearchRole(value: unknown): value is NuidSearchRole {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ROLE_BEHAVIOUR, value);
}

/** The rules from before roles, unchanged. */
function getLegacyBehaviour(field: NuidSearchFieldLike): NuidSearchBehaviour {
    const key = `${field?.key ?? ''}`.toLowerCase();
    const label = `${field?.label ?? ''}`.toLowerCase();
    const isTwinSearch = field?.key === 'BabyTwinNUID';

    return {
        isPrimarySearch: field?.type === 'text'
            && !key.includes('twin')
            && !label.includes('twin')
            && !key.includes('transfer')
            && !label.includes('transfer'),
        isTwinSearch,
        suppliesSessionUid: !isTwinSearch,
        isPreferredPatientId: field?.key === 'patientNUID' || field?.key === 'BabyTransferedNUID',
    };
}

export function getNuidSearchBehaviour(field: NuidSearchFieldLike): NuidSearchBehaviour {
    // The editor only sets a role on search fields; a choice field never searches.
    if (field?.type !== 'dropdown' && isNuidSearchRole(field?.searchRole)) return ROLE_BEHAVIOUR[field.searchRole];
    return getLegacyBehaviour(field);
}
