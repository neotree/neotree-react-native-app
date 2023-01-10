import React from 'react';
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

type TypeFormProps = types.ScreenTypeProps & {
    
};

export function TypeForm({}: TypeFormProps) {
    const ctx = useContext();
    const metadata = ctx?.activeScreen?.data?.metadata;
    const cachedVal = ctx?.activeScreenEntry?.values || [];

    const evaluateFieldCondition = (f: any) => {
        let conditionMet = true; // @ts-ignore
        if (f.condition) conditionMet = ctx?.evaluateCondition(ctx?.parseCondition(f.condition, [{ values }])) as boolean;
        return conditionMet;
    };

    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(metadata.fields.map((f: any) => ({
        value: cachedVal.filter(v => v.key === f.key)[0]?.value || null,
        valueText: cachedVal.filter(v => v.key === f.key)[0]?.valueText || null,
        label: f.label,
        key: f.key,
        type: f.type,
        dataType: f.dataType,
        confidential: f.confidential,
    })));
    
    const setValue = (index: number, val: Partial<types.ScreenEntryValue>) => {
        setValues(prev => prev.map((v, i) => {
            return `${index}` !== `${i}` ? v : {
                ...v,
                ...val
            };
        }));
    };

    React.useEffect(() => {
        const completed = values.reduce((acc, { value }, i) => {
            const field = metadata.fields[i];
            const conditionMet = evaluateFieldCondition(metadata.fields[i]);
            if (conditionMet && !field.optional && !value) return false;            
            return acc;
        }, true);
    
        const hasErrors = values.filter(v => v.error).length;
        ctx?.setEntryValues(hasErrors || !completed ? undefined : values);
    }, [values, metadata]);

    return (
        <Box>
            {metadata.fields.map((f: any, i: number) => {
                return (
                    <React.Fragment key={f.key}>
                        {(() => {
                            let Component: null | React.ComponentType<types.ScreenFormTypeProps> = null;
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
                                        conditionMet={conditionMet}
                                        onChange={onChange}
                                    />
                                    <Br spacing="xl" />
                                </FormItem>
                            );
                        })()}
                    </React.Fragment>
                )
            })}            
        </Box>
    );
}
