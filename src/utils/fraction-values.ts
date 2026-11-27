/**
 * Fraction fields (NEOAPP-1575), e.g. blood pressure 120 / 80.
 *
 * A fraction is captured as two numbers and STORED as two plain number values, each under a key of
 * its own: for a field with key "BP", 120 / 80 is stored as BP_numerator = 120 and BP_denominator = 80.
 * The editor uses the same names (neotree-editor lib/fraction-data-keys.ts), so conditions such as
 * `$BP_numerator > 140` work, and exports, analytics and DHIS read them like any other number key.
 *
 * While the screen is being filled in, the field keeps ONE value under its own key (the form expects
 * one value per field) holding both numbers. `expandFractionValues` turns it into the two stored values;
 * `collapseFractionValue` reads them back when the screen is opened again. Wherever a session is shown
 * or printed, `combineFractionDisplayValues` joins the pair into "120 / 80".
 *
 * Kept free of React Native imports so it can be checked outside the app.
 */

export const FRACTION_FIELD_TYPE = 'fraction';
export const FRACTION_NUMERATOR_SUFFIX = '_numerator';
export const FRACTION_DENOMINATOR_SUFFIX = '_denominator';

export type FractionPart = 'numerator' | 'denominator';

type AnyValue = Record<string, any>;

export function normalizeFieldType(type: any) {
    return `${type ?? ''}`.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function isFractionType(type: any) {
    return normalizeFieldType(type) === FRACTION_FIELD_TYPE;
}

export function getFractionStorageKeys(key: any) {
    const name = `${key ?? ''}`.trim();
    return {
        numeratorKey: `${name}${FRACTION_NUMERATOR_SUFFIX}`,
        denominatorKey: `${name}${FRACTION_DENOMINATOR_SUFFIX}`,
    };
}

export function getFractionLabels(field: AnyValue | null | undefined) {
    return {
        numeratorLabel: `${field?.numeratorLabel ?? ''}`.trim() || 'Numerator',
        denominatorLabel: `${field?.denominatorLabel ?? ''}`.trim() || 'Denominator',
    };
}

const isBlank = (v: any) => v === null || v === undefined || `${v}`.trim() === '';

/** "120 / 80", with the unit when there is one ("120 / 80 mmHg"). Empty when a number is missing. */
export function formatFraction(numerator: any, denominator: any, unit?: any) {
    if (isBlank(numerator) || isBlank(denominator)) return '';
    const text = `${`${numerator}`.trim()} / ${`${denominator}`.trim()}`;
    const u = `${unit ?? ''}`.trim();
    return u ? `${text} ${u}` : text;
}

const toLimit = (v: any) => {
    if (isBlank(v)) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Checks one number of a fraction with the rules a number field uses: a number, no spaces, within
 * min/max, and no more decimals than the field's format allows (format "##.#" = one decimal).
 * Returns the problem, or '' when the number is fine or empty.
 */
export function validateFractionNumber(
    value: any,
    { minValue, maxValue, format }: { minValue?: any; maxValue?: any; format?: any; },
) {
    const text = `${value ?? ''}`;
    if (!text) return '';
    if (text.indexOf(' ') > -1) return 'No spaces allowed';
    const n = Number(text);
    if (isNaN(n)) return 'Input is not a number';
    const max = toLimit(maxValue);
    const min = toLimit(minValue);
    if (max !== null && n > max) return `Max value ${max}`;
    if (min !== null && n < min) return `Min value ${min}`;
    const maxDecimals = format ? `${format}`.replace(/[^#]+/gi, '').length : 0;
    const decimals = text.split('.').filter((_, i) => i > 0).join('');
    if (maxDecimals && decimals.length > maxDecimals) return `Number should have only ${maxDecimals} decimal places.`;
    if (!maxDecimals && text.indexOf('.') > -1) return 'Decimal places not allowed.';
    return '';
}

/**
 * The single in-form value of a fraction field from its two numbers. `value` is set only when both
 * numbers are entered and valid, so the usual "required field has a value" rule applies unchanged.
 */
export function buildFractionFieldValue(
    field: AnyValue,
    numerator: any,
    denominator: any,
): AnyValue {
    const num = isBlank(numerator) ? '' : `${numerator}`.trim();
    const den = isBlank(denominator) ? '' : `${denominator}`.trim();
    const numeratorError = validateFractionNumber(num, field);
    const denominatorError = validateFractionNumber(den, {
        minValue: field?.denominatorMinValue,
        maxValue: field?.denominatorMaxValue,
        format: field?.format,
    });
    const { numeratorLabel, denominatorLabel } = getFractionLabels(field);
    let error = '';
    if (numeratorError) error = `${numeratorLabel}: ${numeratorError}`;
    else if (denominatorError) error = `${denominatorLabel}: ${denominatorError}`;
    else if (!!num !== !!den) error = `Enter both ${numeratorLabel.toLowerCase()} and ${denominatorLabel.toLowerCase()}`;

    const complete = !!num && !!den && !error;
    const text = complete ? formatFraction(num, den) : '';
    return {
        key: field?.key,
        type: FRACTION_FIELD_TYPE,
        exportType: FRACTION_FIELD_TYPE,
        label: field?.label,
        unit: field?.unit,
        numerator: num || null,
        denominator: den || null,
        numeratorLabel,
        denominatorLabel,
        numeratorError,
        denominatorError,
        value: complete ? text : null,
        valueText: complete ? formatFraction(num, den, field?.unit) : null,
        // An incomplete pair (one number only) blocks the screen like an invalid number would.
        error: error || undefined,
    };
}

// Carried from the field's value to both stored numbers (row bookkeeping, print and export flags).
const SHARED_PROPS = [
    'printable', 'confidential', 'prePopulate', 'ips', 'editable',
    'printDisplayColumns', 'calculateValue',
];

/** The two stored number values of one in-form fraction value (none when no number is entered). */
export function expandFractionValue(v: AnyValue): AnyValue[] {
    const key = `${v?.key ?? ''}`.trim();
    if (!key) return [];
    const { numeratorKey, denominatorKey } = getFractionStorageKeys(key);
    const numeratorLabel = `${v?.numeratorLabel ?? ''}`.trim() || 'Numerator';
    const denominatorLabel = `${v?.denominatorLabel ?? ''}`.trim() || 'Denominator';
    const fieldLabel = `${v?.label ?? ''}`.trim() || key;
    const fractionText = formatFraction(v?.numerator, v?.denominator, v?.unit);

    const shared: AnyValue = {};
    SHARED_PROPS.forEach(p => { if (v?.[p] !== undefined) shared[p] = v[p]; });

    const part = (storageKey: string, fractionPart: FractionPart, partLabel: string, raw: any) => {
        if (isBlank(raw)) return null;
        const value = `${raw}`.trim();
        return {
            ...shared,
            key: storageKey,
            value,
            valueText: value,
            exportValue: value,
            exportLabel: value,
            label: `${fieldLabel} (${partLabel})`,
            unit: v?.unit,
            type: 'number',
            dataType: 'number',
            exportType: 'number',
            fractionKey: key,
            fractionPart,
            fractionLabel: fieldLabel,
            fractionText,
        };
    };

    return [
        part(numeratorKey, 'numerator', numeratorLabel, v?.numerator),
        part(denominatorKey, 'denominator', denominatorLabel, v?.denominator),
    ].filter(Boolean) as AnyValue[];
}

/** A form's values with every in-form fraction value replaced by its two stored numbers. */
export function expandFractionValues<T extends AnyValue>(values: T[]): T[] {
    if (!Array.isArray(values) || !values.some(v => isFractionType(v?.type))) return values;
    return values.reduce((acc, v) => {
        if (isFractionType(v?.type)) return [...acc, ...(expandFractionValue(v) as T[])];
        return [...acc, v];
    }, [] as T[]);
}

/**
 * The in-form value of a fraction field rebuilt from what is stored (its two number values, found by
 * key in `stored`). Null when neither number is stored.
 */
export function collapseFractionValue(
    field: AnyValue,
    stored: Map<string, AnyValue> | Record<string, AnyValue> | null | undefined,
): AnyValue | null {
    const { numeratorKey, denominatorKey } = getFractionStorageKeys(field?.key);
    const get = (k: string) => {
        if (!stored) return undefined;
        if (stored instanceof Map) return stored.get(k.toLowerCase()) ?? stored.get(k);
        return stored[k] ?? stored[k.toLowerCase()];
    };
    const numerator = get(numeratorKey)?.value;
    const denominator = get(denominatorKey)?.value;
    if (isBlank(numerator) && isBlank(denominator)) return null;
    return buildFractionFieldValue(field, numerator, denominator);
}

/**
 * For display: each stored fraction pair (two values sharing a `fractionKey`) joined into one value
 * labelled with the field's label and showing "120 / 80 mmHg". A pair with a number missing, and
 * every other value, is left as it is.
 */
export function combineFractionDisplayValues<T extends AnyValue>(values: T[]): T[] {
    if (!Array.isArray(values) || !values.some(v => v?.fractionKey)) return values;

    const byKey = new Map<string, { numerator?: T; denominator?: T; }>();
    values.forEach(v => {
        if (!v?.fractionKey || !v?.fractionPart) return;
        const pair = byKey.get(v.fractionKey) || {};
        pair[v.fractionPart as FractionPart] = v;
        byKey.set(v.fractionKey, pair);
    });

    const done = new Set<string>();
    return values.reduce((acc, v) => {
        const pair = v?.fractionKey ? byKey.get(v.fractionKey) : undefined;
        if (!pair?.numerator || !pair?.denominator) return [...acc, v];
        if (done.has(v.fractionKey)) return acc;
        done.add(v.fractionKey);
        const text = formatFraction(pair.numerator.value, pair.denominator.value, pair.numerator.unit);
        return [...acc, {
            ...pair.numerator,
            key: v.fractionKey,
            label: pair.numerator.fractionLabel || v.fractionKey,
            value: text,
            valueText: text,
            type: FRACTION_FIELD_TYPE,
            exportType: FRACTION_FIELD_TYPE,
        } as T];
    }, [] as T[]);
}
