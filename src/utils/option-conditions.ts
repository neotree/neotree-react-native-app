/**
 * Option-level conditions.
 *
 * A field can carry every option it might ever offer and show only the subset
 * that applies right now — e.g. one "Electronic Signature" dropdown holding
 * every health care worker, each option shown only at their own facility.
 *
 * Before this, authors expressed that by cloning the field once per subset and
 * giving each clone the same key, which the screen cannot support: a field key
 * is also the field's identity, so duplicates collapse into one.
 *
 * Conditions are read from `item.condition`. An empty condition always shows.
 */

type ConditionEvaluator = (condition: string) => boolean;

export function getItemCondition(item: any): string {
    return `${item?.condition ?? ''}`.trim();
}

/** True when a field's options are not all unconditional. */
export function fieldHasConditionalOptions(field: any): boolean {
    const items = field?.items;
    if (!Array.isArray(items)) return false;
    return items.some(item => !!getItemCondition(item));
}

/** Every `$key` an option condition on these fields depends on, lowercased. */
export function collectOptionConditionKeys(field: any): string[] {
    const keys: string[] = [];
    for (const item of (field?.items || [])) {
        const condition = getItemCondition(item);
        if (!condition) continue;
        (condition.match(/\$[\w-]+/g) || []).forEach(token => keys.push(token.slice(1).toLowerCase()));
    }
    return keys;
}

/**
 * The options a field is currently offering. Returns the original array when
 * nothing is filtered, so callers can compare by identity.
 */
export function getVisibleFieldItems(field: any, evaluate: ConditionEvaluator): any[] {
    const items = field?.items;
    if (!Array.isArray(items) || !fieldHasConditionalOptions(field)) return items;

    const visible = items.filter(item => {
        const condition = getItemCondition(item);
        if (!condition) return true;
        try {
            return !!evaluate(condition);
        } catch {
            // A broken expression must not remove a clinician's option.
            return true;
        }
    });

    return visible.length === items.length ? items : visible;
}

/**
 * Applies option conditions across a screen's fields.
 *
 * Field and array identity are preserved wherever nothing changed: the field
 * list is memoised upstream and rows are compared by reference, so returning
 * new objects on every render would defeat that.
 */
export function applyOptionConditions(fields: any[], evaluate: ConditionEvaluator): any[] {
    if (!Array.isArray(fields) || !fields.length) return fields;

    let changed = false;
    const next = fields.map(field => {
        const items = getVisibleFieldItems(field, evaluate);
        if (items === field?.items) return field;
        changed = true;
        return { ...field, items };
    });

    return changed ? next : fields;
}

function normalizeOptionValue(value: any): string {
    return `${value ?? ''}`.trim().toLowerCase();
}

export function getVisibleOptionValues(field: any): Set<string> {
    const values = new Set<string>();
    for (const item of (field?.items || [])) {
        const value = normalizeOptionValue(item?.value);
        if (value) values.add(value);
    }
    return values;
}

/**
 * An answer can outlive the option that carried it — the clinician picks a
 * signature, then corrects the facility. Returns the patch that drops what is
 * no longer offered, or null when the answer is still valid.
 *
 * Only applies to fields with conditional options: everywhere else an answer
 * outside the list is legitimate (manual entry, prepopulation, legacy data).
 */
export function pruneValueToVisibleOptions(
    field: any,
    entryValue: any,
    visibleValues: Set<string>,
): Record<string, any> | null {
    if (!fieldHasConditionalOptions(field)) return null;
    if (!entryValue) return null;

    const value = entryValue.value;

    if (Array.isArray(value)) {
        const kept = value.filter((item: any) => visibleValues.has(normalizeOptionValue(item?.value ?? item)));
        if (kept.length === value.length) return null;
        return { value: kept };
    }

    const normalized = normalizeOptionValue(value);
    if (!normalized || visibleValues.has(normalized)) return null;

    return {
        value: null,
        valueText: null,
        valueLabel: null,
        exportValue: null,
        exportLabel: null,
        value2: null,
        key2: null,
    };
}
