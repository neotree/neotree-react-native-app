import React, { useCallback, useMemo } from 'react';

import { useScriptContext } from '@/src/contexts/script';
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

    const metadata = activeScreen?.data?.metadata;
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

            let value2 = cached?.value2 || null;

            if (`${f.key}`.match(/NUID_/gi) && patientNUID) {
                value = cached?.value || patientNUID;
                valueText = cached?.valueText || patientNUID;
            }

            return {
                printable: f.printable !== false,
                value,
                value2,
                valueText,
                label: f.label,
                key: f.key,
                type: f.type,
                dataType: f.dataType,
                confidential: f.confidential,
                prePopulate: f.prePopulate,
                editable: f.editable
            };
        });
    }, [repeatable, metadata, canAutoFill, cachedVal, getPrepopulationData]);

    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(getValues());

    const evaluateFieldCondition = (f: any, formId?: number) => {
        let conditionMet = true;
        let formatedvalues = values;

    

        if (repeatable) {
            formatedvalues = values.find(v => v.key === 'repeatables')?.value?.[collectionName];

            if (formatedvalues && formatedvalues.length > 0) {

                const filtered = typeof formId === 'number' ? [formatedvalues[formId]] : [];

                if (filtered.length > 0) {
                    formatedvalues = moveKeysInside(filtered);
                } else {
                    formatedvalues = [];
                }
            }

        }

        if (f.condition) {
            conditionMet = evaluateCondition(
                parseCondition(f.condition, [{ values: formatedvalues }])
            ) as boolean;
        }

        return conditionMet;
    };

    const handleRepeatablesChange = (data: Record<string, Repeatable[]>) => {
        try {
            const key = Object.keys(data)[0];
           
            if (data[key].length && data[key]?.[0]?.requiredComplete > 0 && values) {
                // Find the repeatables object in the existing values
                const repeatablesIndex = values.findIndex(item => item.key === 'repeatables');
                let repeatables;

                if (repeatablesIndex === -1) {
                    // Create a new repeatables object if it doesn't exist
                    repeatables = {
                        key: 'repeatables',
                        value: {
                            [key]: data[key],
                        }
                    };
                    const updated = [...values, repeatables]
                    if (updated && updated.length > 0) {
                         setValues(updated);
                        setEntryValues(updated)
                    }
                } else {
                    // Update the existing repeatables object
                    repeatables = { ...values[repeatablesIndex] };

                    // Replace or add the incoming data for the given key
                    repeatables.value[key] = data[key];

                    // Create a new array with the updated repeatables
                    const updatedValues = [
                        ...values.slice(0, repeatablesIndex),
                        repeatables,
                        ...values.slice(repeatablesIndex + 1)
                    ];
                    if (updatedValues && updatedValues.length > 0) {
                         setValues(updatedValues);
                        setEntryValues(deepSanitize(updatedValues))
                    }
                }
            }
        } catch (ex) {
         
        }
    };
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
        if (!Array.isArray(input) || input.length === 0 || input[0] === undefined) {
            return [];
        }

        const [first] = input;

        return Object.entries(first)
            .map(([key, value]) => {
                if (key === 'id' || key === 'createdAt' || key === 'requiredComplete') {
                    return { [key]: value };
                }

                if (typeof value === 'object' && value !== null && 'value' in value) {
                    if (value.value) {
                        return { ...value, key };
                    } else {
                        return null;
                    }
                }

                if (value !== undefined && value !== null && value !== '') {
                    return { [key]: value };
                }

                return null;
            })
            .filter(Boolean);

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

    React.useEffect(() => {

        const completed = repeatable ? (values.length > 0) : values.reduce((acc, { value }, i) => {
            const field = metadata.fields[i];
            const conditionMet = evaluateFieldCondition(metadata.fields[i]);
            if (conditionMet && !field.optional && !value) return false;
            return acc;
        }, true);

        const hasErrors = values.filter(v => v.error).length;
        if (!repeatable) {
            setEntryValues(hasErrors || !completed ? undefined : values);
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

                            // if (!conditionMet) return null;

                            const onChange = (val: Partial<types.ScreenEntryValue>) => setValue(i, val);


                            const allValues = getAllValues()

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
