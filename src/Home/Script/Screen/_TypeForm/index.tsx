import React, { useCallback, useMemo } from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { parseFieldValues, parseFieldItems } from '@/src/utils/script-fields-and-items'; 
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
import { v4 as uuidv4 } from 'uuid';

type TypeFormProps = types.ScreenTypeProps & {};

export function TypeForm({ }: TypeFormProps) {
    const ctx = useScriptContext();

    const {
        activeScreen,
        activeScreenEntry,
        mountedScreens,
        nuidSearchForm,
        evaluateCondition,
        parseCondition,
        getPrepopulationData,
        getRepeatablesPrepopulation,
        setEntryValues,
    } = ctx;

//Fix Slowness Issue, By Prebuilding Fields Before Rendering
  
   const metadata = React.useMemo(() => {
    const original = activeScreen?.data?.metadata;
    if (!original?.fields) return original;

    const hasManual = original.fields.some(
        (f: any) =>
            f.type === "dropdown" &&
            Array.isArray(f.items) &&
            f.items.some((i: any) => i.enterValueManually === true)
    );

    // Transform dropdown and multi_select fields to clear values if items is not empty
    const transformedFields = original.fields.map((field: any) => {
        if ((field.type === "dropdown" || field.type === "multi_select") && Array.isArray(field.items) && field.items.length > 0) {
            return {
                ...field,
                values: "",
            };
        }
        return field;
    });

    if (!hasManual) {
        return {
            ...original,
            fields: transformedFields,
        };
    }
    const updatedFields: any[] = [];
    let positionCounter = 1;

    for (const field of transformedFields) {
        updatedFields.push({
            ...field,
            position: positionCounter++,
        });

        if (field.type === "dropdown" && Array.isArray(field.items)) {
            const manualItems = field.items.filter(
                (i: any) => i.enterValueManually === true
            );

            if (manualItems.length > 0) {
                const manualCondition = manualItems
                    .map((i: any) => `$${field.key} = '${i.value}'`)
                    .join(" or ");

                updatedFields.push({
                    fieldId: uuidv4(),
                    keyId: uuidv4(),
                    type: "text",
                    key: `manual${field.key}`,
                    label: `Specify ${(field.label ?? '').toLowerCase()}`,
                    condition: manualCondition,
                    printable: false,
                    optional: false,
                    editable: true,
                    confidential: false,
                    prePopulate: [],
                    items: [],
                    valuesOptions: [],
                    position: positionCounter++,
                });
            }
        }
    }

    return {
        ...original,
        fields: updatedFields,
    };
}, [activeScreen?.data?.metadata]);

    const cachedVal = activeScreenEntry?.values || [];
    const canAutoFill = !mountedScreens[activeScreen?.id];
    const repeatable = metadata?.repeatable;


    const patientNUID = useMemo(() => {
        return nuidSearchForm
            .filter(f => f.key === 'patientNUID' || f.key === 'BabyTransferedNUID')[0]?.value;
    }, [nuidSearchForm]);

    const getValues = useCallback(() => {
        if (repeatable) return cachedVal;

        return metadata.fields.map((f: any) => {
            const shouldAutoPopulate = (canAutoFill || !!f.prePopulate?.length) && (f.defaultValue !== 'uid');

            const matched = !shouldAutoPopulate ? null : (getPrepopulationData(f.prePopulate)[f.key]?.values?.value || [])[0];

            const cached = cachedVal.filter(v => v.key === f.key)[0];

            let value = cached?.value || `${matched || ''}` || null;
            let valueText = cached?.valueText || matched || null;
            let exportValue: string | undefined = undefined;
            let exportLabel: string | undefined = undefined;

            let value2 = cached?.value2 || null;

            if (`${f.key}`.match(/NUID_/gi) && patientNUID) {
                value = cached?.value || patientNUID;
                valueText = cached?.valueText || patientNUID;
            }

            if (f.type === 'multi_select') {
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

            if (f.type === 'dropdown') {
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

                if (!cached?.value) {
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
                printDisplayColumns: f.printDisplayColumns || activeScreen?.data?.printDisplayColumns,
            };
        });
    }, [repeatable, metadata, canAutoFill, cachedVal,  activeScreen?.printDisplayColumns, getPrepopulationData]);

    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(getValues());


    const evaluateFieldCondition = (f: any,form?:any) => {
        let conditionMet = true;
        let formatedvalues = values;
        if (repeatable) {

            if(form){
               formatedvalues = moveKeysInside([form]);
               
            }

        }
        if (f.condition!="") {
            
            conditionMet = evaluateCondition(
                parseCondition(f.condition, [{ values: formatedvalues }])
            ) as boolean;
        }
       

        return conditionMet;
    };

    const handleRepeatablesChange = React.useCallback((data: Record<string, Repeatable[]>) => {
        try {
            const key = Object.keys(data)[0];

            if (data) {
                {
                    // Find the repeatables object in the existing values
                    const formattedValues = values || []
                    const repeatablesIndex = formattedValues.findIndex(item => item.key === 'repeatables');
                    let repeatables;

                    if (repeatablesIndex === -1) {
                        // Create a new repeatables object if it doesn't exist
                        repeatables = {
                            key: 'repeatables',
                            value: {
                                [key]: data[key],
                            }
                        };
                        const updated = [...formattedValues, repeatables]
                        if (updated && updated.length > 0) {
                            const sanitized = deepSanitize(updated);
                            setValues(sanitized);
                            setEntryValues(sanitized)
                        

                        }
                    } else {
                        // Update the existing repeatables object
                        repeatables = { ...formattedValues[repeatablesIndex] };

                        repeatables.value[key] = data[key];

                        // Create a new array with the updated repeatables
                        const updatedValues = [
                            ...formattedValues.slice(0, repeatablesIndex),
                            repeatables,
                            ...formattedValues.slice(repeatablesIndex + 1)
                        ];
                        if (updatedValues && updatedValues.length > 0) {
                            const sanitized = deepSanitize(updatedValues);
                            setValues(sanitized);
                            setEntryValues(sanitized)
                        }
                    }
                }
            }
        } catch (ex) {

        }
    }, [values, setEntryValues]);
    function deepSanitize(input: any): any {
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
    }


   function moveKeysInside(input: any[]): any[] {
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
}


    const setValue = useCallback((index: number, val: Partial<types.ScreenEntryValue>) => {
        setValues(prev => prev.map((v, i) => {
            const state = `${index}` !== `${i}` ? v : {
                ...v,
                ...val
            };
            return state;
        }));
    }, []);

    const setValueByKey = useCallback((key: string, val: Partial<types.ScreenEntryValue>) => {
        if (!key) return;
        setValues(prev =>
            prev.map(entry =>
                `${entry.key}`.toLowerCase() === `${key}`.toLowerCase()
                    ? { ...entry, ...val }
                    : entry
            )
        );
    }, []);

    React.useEffect(() => {

        const completed = repeatable ? (values.length > 0) : values.reduce((acc, { value }, i) => {
            const field = metadata.fields[i];
            const conditionMet = evaluateFieldCondition(metadata.fields[i]);
            if (conditionMet && !field.optional && !value) return false;
            return acc;
        }, true);

        const hasErrors = values.filter(v => v.error).length;
        if (!repeatable) {
            const entryVals = values.filter(v => {
                if (
                    (v?.value === null) || 
                    (v?.value === undefined) || 
                    (v?.value === '')
                ) return false;

                return true;
            });

            setEntryValues(hasErrors || !completed ? undefined : entryVals);
        }

    }, [values, metadata]);


    const collectionName = metadata?.collectionName;
    const collectionField = metadata?.collectionLabel;
    const getAllValues = () => {

        let _allValues = [
            ...values,
            ...ctx.entries.reduce((acc: types.ScreenEntry['values'], e) => [
                ...acc,
                ...e.values,
            ], []),
        ];
        if (repeatable && !values.find(v => v.key === 'repeatables')?.value) {
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

            _allValues = [
                ...values,
                {
                    key: 'repeatables',
                    value: repeatablesGrouped,
                },
            ];
        }

        return _allValues.filter((v, i) => {
            if (!v.key) return true;
            return _allValues.map(v => `${v.key}`.toLowerCase()).indexOf(`${v.key}`.toLowerCase()) === i;
        });
    }

    const getRepeatableValues = () => {
        const values = getAllValues()
        const autoFill = getRepeatablesPrepopulation() ? getRepeatablesPrepopulation()[collectionName] : []
        return values.filter(v => v.key === 'repeatables')[0]?.value?.[collectionName] || autoFill;
    }

    const returnable = (
        <Box>
            {metadata.fields.map((f: any, i: number) => {
                return (
                    <React.Fragment key={f.key}>
                        {(() => {
                            let Component: null | React.ComponentType<types.ScreenFormTypeProps & { patientNUID?: string | null; }> = null;
                            switch (f.type) {
                                case fieldsTypes.NUMBER:
                                    Component = NumberField;
                                    break;
                                case fieldsTypes.DATE:
                                    Component = DateField;
                                    break;
                                case fieldsTypes.DATETIME:
                                    Component = DateField;
                                    break;
                                case fieldsTypes.DROPDOWN:
                                    Component = DropDownField;
                                    break;
                                case fieldsTypes.PERIOD:
                                    Component = PeriodField;
                                    break;
                                case fieldsTypes.TEXT:
                                    Component = TextField;
                                    break;
                                case fieldsTypes.TIME:
                                    Component = TimeField;
                                    break;
                                case fieldsTypes.MULTI_SELECT:
                                    Component = MultiSelectField;
                                    break;
                                default:
                            
                                // do nothing
                            }
                            
                            if (!Component) return null;

                            const conditionMet = evaluateFieldCondition(f);

                            if (!conditionMet) return null;

                            const updateFieldValue = (val: Partial<types.ScreenEntryValue>) => setValue(i, val);
                            const shouldLog = ['date', 'datetime', 'period'].includes(f.type);
                            const onChange = (val: Partial<types.ScreenEntryValue>) => {
                                if (shouldLog) {
                                    const incoming = val || {};
                                    console.log('[NonRepeatable][handleChange]', {
                                        isRepeatable: false,
                                        fieldKey: f.key,
                                        fieldLabel: f.label,
                                        fieldType: f.type,
                                        incoming: {
                                            value: incoming?.value ?? null,
                                            valueText: incoming?.valueText ?? null,
                                            exportValue: incoming?.exportValue ?? null,
                                            calculateValue: incoming?.calculateValue ?? null,
                                            label: incoming?.label ?? null,
                                        },
                                    });
                                }
                                updateFieldValue(val);
                            };

                            const allValues = getAllValues()

                            const extraProps = Component === PeriodField ? { onLinkedFieldChange: setValueByKey } : {};

                            return (
                                <FormItem
                                    field={f}
                                    onChange={onChange}
                                    conditionMet={conditionMet}
                                >
                                    <Component
                                        field={f}
                                        fieldIndex={i}
                                        entryValue={values.filter(v => v.key === f.key)[0]}
                                        formValues={values}
                                        allValues={allValues}
                                        conditionMet={conditionMet}
                                        patientNUID={patientNUID}
                                        onChange={onChange}
                                        {...extraProps}
                                    />
                                    <Br spacing="xl" />
                                </FormItem>
                            );
                        })()}
                    </React.Fragment>
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
            allValues={getRepeatableValues()}
        /> : returnable
    );
}
