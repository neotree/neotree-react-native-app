import React, { useMemo } from 'react';
import { Box, Br } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';
import { fieldsTypes } from '../../../../constants';
import { FormItem } from './FormItem';

import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField } from './_Period';
import { TimeField } from './_Time';
import Repeatable from './Repeatable';

type TypeFormProps = types.ScreenTypeProps & {};

export function TypeForm({ }: TypeFormProps) {
    const ctx = useContext();

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

    const patientNUID = useMemo(() => nuidSearchForm.filter(f => f.key === 'patientNUID' || f.key === 'BabyTransferedNUID')[0]?.value, [nuidSearchForm]);

    const [values, setValues] =React.useState<types.ScreenEntryValue[]>(!repeatable?metadata.fields.map((f: any) => {
     
       
        const shouldAutoPopulate = (canAutoFill || !!f.prePopulate?.length) && (f.defaultValue !== 'uid');

        const matched = !shouldAutoPopulate ? null : (getPrepopulationData(f.prePopulate)[f.key]?.values?.value || [])[0];
        
        const cached = cachedVal.filter(v => v.key === f.key)[0];
    
        let value = cached?.value || `${matched || ''}` || null;
        let valueText = cached?.valueText || matched || null;

        if (`${f.key}`.match(/NUID_/gi) && patientNUID) {
            value = cached?.value || patientNUID;
            valueText = cached?.valueText || patientNUID;
        }

        return {
            printable: f.printable !== false,
            value,
            valueText,
            label: f.label,
            key: f.key,
            type: f.type,
            dataType: f.dataType,
            confidential: f.confidential,
            prePopulate: f.prePopulate,
            editable: f.editable
        };
    }):cachedVal);

    const evaluateFieldCondition = (f: any) => {
        let conditionMet = true;
        if (f.condition) conditionMet = evaluateCondition(parseCondition(f.condition, [{ values }])) as boolean;
        return conditionMet;
    };

    const handleRepeatablesChange = (data: Record<string, Repeatable[]>) => {
        const key = Object.keys(data)[0];
        if (data[key].length > 0 && key) {
            // Find the repeatables object in the existing values
            const repeatablesIndex = values.findIndex(item => item.key === 'repeatables');
            let repeatables;
    
            if (repeatablesIndex === -1) {
                // Create a new repeatables object if it doesn't exist
                repeatables = {
                    key: 'repeatables',
                    value: {
                        [key]: data[key], // Use the correct data structure
                    }
                };
                setValues([...values, repeatables]);
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

                setValues(updatedValues);
            }
        }
    };

    const setValue = (index: number, val: Partial<types.ScreenEntryValue>) => {
        setValues(prev => prev.map((v, i) => {
            return `${index}` !== `${i}` ? v : {
                ...v,
                ...val
            };
        }));
    };

    React.useEffect(() => {
    
        const completed = repeatable?(values.length>0):values.reduce((acc, { value }, i) => {
            const field = metadata.fields[i];
            const conditionMet = evaluateFieldCondition(metadata.fields[i]);
            if (conditionMet && !field.optional && !value) return false;
            return acc;
        }, true);
        
        const hasErrors = values.filter(v => v.error).length;
        setEntryValues(hasErrors || !completed ? undefined : values);

    }, [values, metadata]);

   
    const collectionName = metadata?.collectionName;
    const collectionField = metadata?.collectionLabel;
    const getAllValues = () => {
    
        const _allValues = [
            ...values,
            ...ctx.entries.reduce((acc: types.ScreenEntry['values'], e) => [
                ...acc,
                ...e.values,
            ], []),
        ];

        return _allValues.filter((v, i) => {
            if (!v.key) return true;
            return _allValues.map(v => `${v.key}`.toLowerCase()).indexOf(`${v.key}`.toLowerCase()) === i;
        });
    }

    const getRepeatableValues =()=>{
        const values = getAllValues()
        const autoFill = getRepeatablesPrepopulation()?getRepeatablesPrepopulation()[collectionName]:[]
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
                                default:

                                // do nothing
                            }

                            if (!Component) return null;

                            const conditionMet = evaluateFieldCondition(f);
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