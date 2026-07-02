import React, { useCallback, useMemo } from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items'; 
import { filterFieldToBidStillBirthOptions } from '@/src/utils/bid-stillbirth-outcome';
import {
    formatDateLikeLabel,
    isTimestampLabel,
    normalizeDateLikeValue,
} from '@/src/utils/date-value-normalization';
import { Box, Br } from '../../../../components';
import * as types from '../../../../types';
import { fieldsTypes } from '../../../../constants';
import { FormItem } from './FormItem';
import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField } from './_Period';
import { TimeField } from './_Time';
import { MultiSelectField } from './_MultiSelect';
import Repeatable from './Repeatable';

type TypeFormProps = types.ScreenTypeProps & {};
const EMPTY_VALUES: types.ScreenEntry['values'] = [];

type FieldComponent = React.ComponentType<types.ScreenFormTypeProps & { patientNUID?: string | null; }>;

const getFieldComponent = (normalizedFieldType: string): FieldComponent | null => {
    switch (normalizedFieldType) {
        case fieldsTypes.NUMBER:
            return NumberField;
        case fieldsTypes.DATE:
        case fieldsTypes.DATETIME:
            return DateField;
        case fieldsTypes.DROPDOWN:
            return DropDownField;
        case fieldsTypes.PERIOD:
            return PeriodField;
        case fieldsTypes.TEXT:
            return TextField;
        case fieldsTypes.TIME:
            return TimeField;
        case fieldsTypes.MULTI_SELECT:
            return MultiSelectField;
        default:
            return null;
    }
};

const fieldNeedsAllValues = (normalizedFieldType: string) => (
    normalizedFieldType === fieldsTypes.NUMBER
    || normalizedFieldType === fieldsTypes.DATE
    || normalizedFieldType === fieldsTypes.DATETIME
    || normalizedFieldType === fieldsTypes.PERIOD
);

const fieldNeedsFormValues = (normalizedFieldType: string) => normalizedFieldType === fieldsTypes.PERIOD;
const fieldNeedsPatientNUID = (normalizedFieldType: string) => normalizedFieldType === fieldsTypes.TEXT;

type FieldRowProps = {
    field: any;
    normalizedFieldType: string;
    fieldIndex: number;
    entryValue?: types.ScreenEntryValue;
    formValues?: types.ScreenEntry['values'];
    allValues?: types.ScreenEntry['values'];
    conditionMet: boolean;
    patientNUID?: string | null;
    onChangeByKey: (key: string, val: Partial<types.ScreenEntryValue>) => void;
    onLinkedFieldChange?: (key: string, value: Partial<types.ScreenEntryValue>) => void;
};

const FieldRow = React.memo(function FieldRow({
    field,
    normalizedFieldType,
    fieldIndex,
    entryValue,
    formValues,
    allValues,
    conditionMet,
    patientNUID,
    onChangeByKey,
    onLinkedFieldChange,
}: FieldRowProps) {
    const Component = React.useMemo(() => getFieldComponent(normalizedFieldType), [normalizedFieldType]);
    const shouldLog = normalizedFieldType === fieldsTypes.DATE
        || normalizedFieldType === fieldsTypes.DATETIME
        || normalizedFieldType === fieldsTypes.PERIOD;

    const onChange = React.useCallback((val: Partial<types.ScreenEntryValue>) => {
        if (shouldLog) {
            const incoming = val || {};
            console.log('[NonRepeatable][handleChange]', {
                isRepeatable: false,
                fieldKey: field.key,
                fieldLabel: field.label,
                fieldType: field.type,
                incoming: {
                    value: incoming?.value ?? null,
                    valueText: incoming?.valueText ?? null,
                    exportValue: incoming?.exportValue ?? null,
                    calculateValue: incoming?.calculateValue ?? null,
                    label: incoming?.label ?? null,
                },
            });
        }

        onChangeByKey(field.key, val);
    }, [field.key, field.label, field.type, onChangeByKey, shouldLog]);

    if (!Component || !conditionMet) return null;

    const extraProps = Component === PeriodField && onLinkedFieldChange
        ? { onLinkedFieldChange }
        : {};

    return (
        <FormItem
            field={field}
            onChange={onChange}
            conditionMet={conditionMet}
        >
            <Component
                field={field}
                fieldIndex={fieldIndex}
                entryValue={entryValue as types.ScreenEntryValue}
                formValues={formValues || EMPTY_VALUES}
                allValues={allValues || EMPTY_VALUES}
                conditionMet={conditionMet}
                patientNUID={patientNUID}
                onChange={onChange}
                {...extraProps}
            />
            <Br spacing="xl" />
        </FormItem>
    );
}, (prev, next) => (
    prev.field === next.field
    && prev.normalizedFieldType === next.normalizedFieldType
    && prev.fieldIndex === next.fieldIndex
    && prev.entryValue === next.entryValue
    && prev.formValues === next.formValues
    && prev.allValues === next.allValues
    && prev.conditionMet === next.conditionMet
    && prev.patientNUID === next.patientNUID
    && prev.onChangeByKey === next.onChangeByKey
    && prev.onLinkedFieldChange === next.onLinkedFieldChange
));

export function TypeForm(_: TypeFormProps) {
    const ctx = useScriptContext();
    const lastEntryValuesSignatureRef = React.useRef<string | null>(null);

    const {
        activeScreen,
        activeScreenEntry,
        mountedScreens,
        nuidSearchForm,
        startSessionMode,
        eligibilityAutoFillValues,
        configuration,
        evaluateCondition,
        parseCondition,
        getPrepopulationData,
        getRepeatablesPrepopulation,
        setEntryValues,
    } = ctx;

// Keep field metadata stable. Expanding synthetic manual-entry fields here
// causes extra condition work and broader rerenders in large management forms.
    const normalizeFieldType = React.useCallback((fieldType: any) => {
        return `${fieldType ?? ''}`.trim().toLowerCase().replace(/[\s-]+/g, '_');
    }, []);
  
    const metadata = React.useMemo(() => {
        const original = activeScreen?.data?.metadata;
        if (!original?.fields) return original;

        const transformedFields = original.fields.map((field: any) => {
            const normalizedType = normalizeFieldType(field.type);
            const transformedField = (() => {
                if (
                    (normalizedType === "dropdown" || normalizedType === "multi_select") &&
                    Array.isArray(field.items) &&
                    field.items.length > 0
                ) {
                    return {
                        ...field,
                        values: "",
                    };
                }
                return field;
            })();

            if (startSessionMode === 'bidStillBirth') {
                return filterFieldToBidStillBirthOptions(transformedField);
            }

            return transformedField;
        });

        return {
            ...original,
            fields: transformedFields,
        };
    }, [activeScreen?.data?.metadata, normalizeFieldType, startSessionMode]);

    const cachedVal = useMemo(() => activeScreenEntry?.values || [], [activeScreenEntry?.values]);
    const canAutoFill = !mountedScreens[activeScreen?.id];
    const repeatable = metadata?.repeatable;
    const cachedValuesByKey = useMemo(() => {
        const map = new Map<string, types.ScreenEntryValue>();
        cachedVal.forEach(value => {
            const key = `${value?.key || ''}`.toLowerCase();
            if (key) map.set(key, value);
        });
        return map;
    }, [cachedVal]);


    const patientNUID = useMemo(() => {
        const primarySearch = nuidSearchForm
            .find(f => (
                (f.key === 'patientNUID' || f.key === 'BabyTransferedNUID') &&
                f.value
            ));
        const nuidSearch = nuidSearchForm.find(f => (
            f.results &&
            f.results.useSearchedUidForSession === true &&
            (f.value || f.results.uid || f.results.searchedUid)
        ));

        return primarySearch?.value
            ?? nuidSearch?.value
            ?? nuidSearch?.results?.uid
            ?? nuidSearch?.results?.searchedUid;
    }, [nuidSearchForm]);

    const getValues = useCallback(() => {
        if (repeatable) return cachedVal;

        return metadata.fields.map((f: any) => {
            const shouldAutoPopulate = (canAutoFill || !!f.prePopulate?.length) && (f.defaultValue !== 'uid');

            const matched = !shouldAutoPopulate ? null : (getPrepopulationData(f.prePopulate)[f.key]?.values?.value || [])[0];

            const cached = cachedValuesByKey.get(`${f.key || ''}`.toLowerCase());
            const eligibilityAutoFill = eligibilityAutoFillValues.find(
                v => `${v.key}`.toLowerCase() === `${f.key}`.toLowerCase()
            );

            let value = cached?.value || eligibilityAutoFill?.value || `${matched || ''}` || null;
            let valueText = cached?.valueText || eligibilityAutoFill?.valueText || matched || null;
            let exportValue: string | undefined = eligibilityAutoFill?.exportValue;
            let exportLabel: string | undefined = eligibilityAutoFill?.exportLabel;

            let value2 = cached?.value2 || eligibilityAutoFill?.value2 || null;

            if (`${f.key}`.match(/NUID_/gi) && patientNUID) {
                value = cached?.value || patientNUID;
                valueText = cached?.valueText || patientNUID;
            }

            const normalizedFieldType = normalizeFieldType(f.type);

            if (normalizedFieldType === 'multi_select') {
                const opts = (() => {
                    if (!f?.items) {
                        return parseFieldValues({
                            values: f.values,
                            options: f.valuesOptions,
                        });
                    } else {
                        return parseFieldItems({ items: f.items, });
                    }
                })();
                const matches = getPrepopulationData(['allSearches']);
                const fieldMatch: any = Object.values(matches).find((field: any) => field?.values?.parentKey === f.key);
                const selected = fieldMatch?.values?.value || [];
                value = cached?.value || opts.filter(o => selected.includes(o.value)).map(o => ( {
                    value: o.value,
                    key: o.value,
                    // valueLabel: o.label,
                    valueText: o.label,
                    exportLabel: o.label,
                    value2: o.option ? '' : undefined,
                    key2: o.option ? '' : undefined,
                    parentKey: f.key,
                    exclusive: o.exclusive,
                    enterValueManually: o.enterValueManually,
                }));
            }

            if (normalizedFieldType === 'dropdown') {
                const opts = (() => {
                    if (!f?.items) {
                        return parseFieldValues({
                            values: f.values,
                            options: f.valuesOptions,
                        });
                    } else {
                        return parseFieldItems({ items: f.items, });
                    }
                })();
                const matchedOpt = opts.find(o => `${o.value}` === `${matched || ''}`);

                if (!cached?.value && !eligibilityAutoFill?.value) {
                    value = null;
                    valueText = null;
                    
                    if (matchedOpt) {
                        value = matchedOpt.value;
                        exportValue = matchedOpt.value;
                        valueText = matchedOpt.label;
                        exportLabel = matchedOpt.label;
                    }
                }
            }

            if ([fieldsTypes.DATE, fieldsTypes.DATETIME, fieldsTypes.TIME].includes(f.type)) {
                const normalizedValue = normalizeDateLikeValue(value, f.type);
                if (normalizedValue) {
                    value = normalizedValue;
                }

                const currentText = typeof valueText === 'string' ? valueText : null;
                const shouldNormalizeLabel =
                    !currentText ||
                    isTimestampLabel(currentText) ||
                    `${currentText}` === `${value ?? ''}`;

                if (shouldNormalizeLabel) {
                    const formattedLabel = formatDateLikeLabel(value, f.type);
                    if (formattedLabel) {
                        valueText = formattedLabel;
                        exportLabel = formattedLabel;
                    }
                }
            }

            return {
                printable: f.printable !== false,
                value,
                value2,
                valueText,
                label: f.label,
                unit: f.unit,
                key: f.key,
                type: f.type,
                dataType: f.dataType,
                confidential: f.confidential,
                prePopulate: f.prePopulate,
                editable: f.editable,
                ips: f.ips,
                exportValue,
                exportLabel,
                calculateValue: cached?.calculateValue ?? eligibilityAutoFill?.calculateValue,
                printDisplayColumns: f.printDisplayColumns || activeScreen?.data?.printDisplayColumns,
            };
        });
    }, [repeatable, metadata, canAutoFill, patientNUID, activeScreen?.data?.printDisplayColumns, eligibilityAutoFillValues, getPrepopulationData, normalizeFieldType, cachedVal, cachedValuesByKey]);

    // Lazy initializer: getValues does a full pass over every field (prepopulation,
    // option parsing), so it must only run once at mount, not on every render.
    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(getValues);


    const deepSanitize = React.useCallback((input: any): any => {
        if (input == null) {
            // handles both null and undefined
            return input;
        }

        if (Array.isArray(input)) {
            return input.map(deepSanitize);
        }

        if (typeof input === 'object' && Object.prototype.toString.call(input) === '[object Object]') {
            const clean: Record<string, any> = {};
            for (const [key, value] of Object.entries(input)) {
                if (!/^\d+$/.test(key)) {
                    clean[key] = deepSanitize(value);
                }
            }
            return clean;
        }

        // Primitives, functions, Dates, etc. are returned as-is
        return input;
    }, []);


   const moveKeysInside = React.useCallback((input: any[]): any[] => {
        if (!Array.isArray(input) || input.length === 0) {
            return [];
        }

        const result: any[] = [];

        for (const item of input) {
            if (typeof item !== "object" || item === null) continue;

            if ("values" in item && typeof item.values === "object" && item.values !== null) {
                for (const [key, value] of Object.entries(item.values)) {
                    if (value && typeof value === "object" && "value" in value) {
                        if (value.value !== null && value.value !== undefined && value.value !== "") {
                            result.push({ value: value.value, key });
                        }
                    }
                }
            }

            // keep directly if the object itself has "value"
            else if ("value" in item && Object.keys(item).length === 1) {
                result.push({ value: item.value, key: Object.keys(item)[0] });
            }
        }

        return result;
    }, []);

    const evaluateFieldCondition = React.useCallback((f: any, form?: any) => {
        let conditionMet = true;
        let formatedvalues = values;
        if (repeatable) {
            if (form) {
                formatedvalues = moveKeysInside([form]);
            }
        }

        const condition = `${f?.condition ?? ''}`.trim();

        if (condition) {
            conditionMet = evaluateCondition(
                parseCondition(condition, [{ values: formatedvalues }])
            ) as boolean;
        }

        return conditionMet;
    }, [evaluateCondition, moveKeysInside, parseCondition, repeatable, values]);

    const handleRepeatablesChange = React.useCallback((data: Record<string, Repeatable[]>) => {
        try {
            const key = Object.keys(data)[0];

            if (data) {
                const formattedValues = values || [];
                const repeatablesIndex = formattedValues.findIndex(item => item.key === 'repeatables');
                let repeatables;

                if (repeatablesIndex === -1) {
                    repeatables = {
                        key: 'repeatables',
                        value: {
                            [key]: data[key],
                        }
                    };
                    const updated = [...formattedValues, repeatables];
                    if (updated.length > 0) {
                        const sanitized = deepSanitize(updated);
                        setValues(sanitized);
                        setEntryValues(sanitized);
                    }
                } else {
                    repeatables = { ...formattedValues[repeatablesIndex] };
                    repeatables.value[key] = data[key];

                    const updatedValues = [
                        ...formattedValues.slice(0, repeatablesIndex),
                        repeatables,
                        ...formattedValues.slice(repeatablesIndex + 1)
                    ];

                    if (updatedValues.length > 0) {
                        const sanitized = deepSanitize(updatedValues);
                        setValues(sanitized);
                        setEntryValues(sanitized);
                    }
                }
            }
        } catch {
            // ignore malformed repeatable payloads
        }
    }, [deepSanitize, setEntryValues, values]);
    const setValueByKey = useCallback((key: string, val: Partial<types.ScreenEntryValue>) => {
        if (!key) return;
        setValues(prev => {
            const normalizedKey = `${key}`.toLowerCase();
            let changed = false;
            const nextValues = prev.map(entry => {
                if (`${entry.key}`.toLowerCase() !== normalizedKey) {
                    return entry;
                }

                changed = true;
                return { ...entry, ...val };
            });

            return changed ? nextValues : prev;
        });
    }, []);

    const valuesByKey = React.useMemo(() => {
        const map = new Map<string, types.ScreenEntryValue>();
        values.forEach(value => {
            const key = `${value?.key || ''}`.toLowerCase();
            if (key) map.set(key, value);
        });
        return map;
    }, [values]);

    const allValues = React.useMemo(() => {
        let mergedValues = [
            ...values,
            ...ctx.entries.reduce((acc: types.ScreenEntry['values'], entry) => [
                ...acc,
                ...entry.values,
            ], []),
        ];

        if (repeatable && !valuesByKey.get('repeatables')?.value) {
            const repeatablesGrouped: Record<string, any[]> = {};

            ctx.entries.forEach(entry => {
                const repeatables = entry.repeatables || {};
                Object.entries(repeatables).forEach(([key, items]) => {
                    if (!repeatablesGrouped[key]) {
                        repeatablesGrouped[key] = [];
                    }

                    if (Array.isArray(items)) {
                        repeatablesGrouped[key].push(...items);
                    } else {
                        repeatablesGrouped[key].push(items);
                    }
                });
            });

            mergedValues = [
                ...values,
                {
                    key: 'repeatables',
                    value: repeatablesGrouped,
                },
            ];
        }

        const seenKeys = new Set<string>();
        return mergedValues.filter(value => {
            if (!value.key) return true;

            const normalizedKey = `${value.key}`.toLowerCase();
            if (seenKeys.has(normalizedKey)) return false;

            seenKeys.add(normalizedKey);
            return true;
        });
    }, [ctx.entries, repeatable, values, valuesByKey]);

    // Keys referenced by any field condition on this screen (the `$key` tokens).
    // Values outside this set can never change a condition's outcome.
    const conditionDependencyKeys = React.useMemo(() => {
        const keys = new Set<string>();
        metadata?.fields?.forEach((field: any) => {
            const condition = `${field?.condition ?? ''}`;
            (condition.match(/\$[\w-]+/g) || []).forEach(token => {
                keys.add(token.slice(1).toLowerCase());
            });
        });
        return keys;
    }, [metadata?.fields]);

    // Compact fingerprint of the condition-relevant slice of the form values.
    // value2 (manual-entry text) only reaches conditions through key2 or
    // multi-select item lists, so plain typing does not alter the signature.
    const conditionValuesSignature = React.useMemo(() => {
        if (!conditionDependencyKeys.size) return '';

        const parts: string[] = [];

        values.forEach(v => {
            const key = `${v?.key || ''}`.toLowerCase();
            const key2 = `${v?.key2 || ''}`.toLowerCase();

            const referencesKey = !!key && conditionDependencyKeys.has(key);
            const referencesKey2 = !!key2 && conditionDependencyKeys.has(key2);
            const referencesArrayItem = Array.isArray(v?.value) && v.value.some((item: any) => {
                const itemKey = `${item?.key || ''}`.toLowerCase();
                const itemKey2 = `${item?.key2 || ''}`.toLowerCase();
                const parentKey = `${item?.parentKey || ''}`.toLowerCase();
                return (!!itemKey && conditionDependencyKeys.has(itemKey))
                    || (!!itemKey2 && conditionDependencyKeys.has(itemKey2))
                    || (!!parentKey && conditionDependencyKeys.has(parentKey));
            });

            if (!referencesKey && !referencesKey2 && !referencesArrayItem) return;

            parts.push(JSON.stringify([
                key,
                v?.value ?? null,
                v?.calculateValue ?? null,
                (referencesKey2 || referencesArrayItem) ? (v?.value2 ?? null) : null,
                key2,
            ]));
        });

        return parts.join('|');
    }, [conditionDependencyKeys, values]);

    const conditionMetByKey = React.useMemo(() => {
        const map = new Map<string, boolean>();
        metadata?.fields?.forEach((field: any) => {
            map.set(`${field?.key || ''}`.toLowerCase(), evaluateFieldCondition(field));
        });
        return map;
        // Running the eval-based condition sweep on every value commit is what froze
        // large forms. While this screen is mounted, other entries/searches are static
        // and the current screen's entry only echoes `values`, so outcomes can only
        // change with the signature, the fields themselves, or the global configuration.
        // evaluateFieldCondition is deliberately omitted: whenever the memo does re-run,
        // the factory closes over the fresh callback anyway.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metadata?.fields, conditionValuesSignature, configuration]);

    const computedEntryValues = React.useMemo(() => {
        if (repeatable) return undefined;

        const entryValsToRemove: number[] = [];

        const completed = values.reduce((acc, { value }, i) => {
            const field = metadata.fields[i];
            const conditionMet = conditionMetByKey.get(`${field?.key || ''}`.toLowerCase()) ?? true;

            let hasValue = !!value;
            if (normalizeFieldType(field?.type) === fieldsTypes.MULTI_SELECT) hasValue = !!value?.length;
            if (field?.optional) hasValue = true;

            if (!conditionMet) entryValsToRemove.push(i);

            if (conditionMet && !hasValue) return false;
            return acc;
        }, true);

        // Ignore errors on fields whose condition is no longer met — they are not
        // rendered, so a stale error there would block completion invisibly.
        const hasErrors = values.some((v, i) => !entryValsToRemove.includes(i) && !!v.error);

        if (hasErrors || !completed) {
            return undefined;
        }

        return values.filter((v, i) => {
            if (entryValsToRemove.includes(i)) return false;

            return (
                v?.value !== null
                && v?.value !== undefined
                && v?.value !== ''
            );
        });
    }, [conditionMetByKey, metadata.fields, normalizeFieldType, repeatable, values]);

    React.useEffect(() => {
        if (!repeatable) {
            const nextSignature = computedEntryValues ? JSON.stringify(computedEntryValues) : 'undefined';
            if (lastEntryValuesSignatureRef.current !== nextSignature) {
                lastEntryValuesSignatureRef.current = nextSignature;
                setEntryValues(computedEntryValues);
            }
        }
    }, [computedEntryValues, repeatable, setEntryValues]);


    const collectionName = metadata?.collectionName;
    const collectionField = metadata?.collectionLabel;
    const repeatableValues = React.useMemo(() => {
        const autoFill = getRepeatablesPrepopulation() ? getRepeatablesPrepopulation()[collectionName] : [];
        return allValues.find(v => v.key === 'repeatables')?.value?.[collectionName] || autoFill;
    }, [allValues, collectionName, getRepeatablesPrepopulation]);

    const returnable = (
        <Box>
            {metadata.fields.map((f: any, i: number) => {
                const normalizedFieldType = normalizeFieldType(f.type);
                const Component = getFieldComponent(normalizedFieldType);

                if (!Component) return null;

                return (
                    <FieldRow
                        key={f.key}
                        field={f}
                        normalizedFieldType={normalizedFieldType}
                        fieldIndex={i}
                        entryValue={valuesByKey.get(`${f.key || ''}`.toLowerCase())}
                        formValues={fieldNeedsFormValues(normalizedFieldType) ? values : undefined}
                        allValues={fieldNeedsAllValues(normalizedFieldType) ? allValues : undefined}
                        conditionMet={conditionMetByKey.get(`${f.key || ''}`.toLowerCase()) ?? true}
                        patientNUID={fieldNeedsPatientNUID(normalizedFieldType) ? patientNUID : undefined}
                        onChangeByKey={setValueByKey}
                        onLinkedFieldChange={normalizedFieldType === fieldsTypes.PERIOD ? setValueByKey : undefined}
                    />
                );
            })}
        </Box>
    );

    return (
        repeatable ? <Repeatable collectionName={collectionName}
            fields={metadata.fields}
            onChange={handleRepeatablesChange}
            evaluateCondition={evaluateFieldCondition}
            collectionField={collectionField}
            allValues={repeatableValues}
        /> : returnable
    );
}
