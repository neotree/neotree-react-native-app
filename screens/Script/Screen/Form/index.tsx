import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme, Br, Text } from '@/components/ui';
import { fieldsTypes } from '@/constants/screen';
import { FieldDate } from './Date';
import { DateTime } from './DateTime';
import { DropDown } from './DropDown';
import { FieldText } from './Text';
import { Period } from './Period';
import { Time } from './Time';
import { FieldNumber } from './Number';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps, ScreenFormFieldComponentProps } from '../../types';
import { evaluateCondition } from '../../utils';
import { Field } from './Field';

export function Form(props: ScreenComponentProps) {
    const { canAutoFill, setEntry: onChange, } = props;
    const { 
        activeScreen: screen, 
        autoFill,
        activeScreenCachedEntry: value,
        parseCondition,
        ...ctx
    } = useScriptContext();
    const metadata = { ...screen.data.metadata };
    const fields = metadata?.fields || [];

    const defaultValue = fields.map(f => ({
        value: null,
        valueText: null,
        label: f.label,
        key: f.key,
        type: f.type,
        dataType: f.dataType,
        confidential: f.confidential,
    }));

    const [entry, setEntry] = React.useState({ values: defaultValue, ...value });
    const [entryCache, setEntryCache] = React.useState({ values: defaultValue, ...value });

    const _onChange = (index, newVal) => {
    setEntry(prevState => ({
        ...prevState,
        values: prevState.values.map((v, i) => {
            if (i === index) return { ...v, ...newVal };
            return v;
        })
    }));
    };

    const setCache = (index, newVal) => setEntryCache(prevState => ({
        ...prevState,
        values: prevState.values.map((v, i) => {
            if (i === index) return { ...v, ...newVal };
            return v;
        })
    }));

    const evaluateFieldCondition = f => {
        let conditionMet = true;
        if (f.condition) conditionMet = evaluateCondition(parseCondition(f.condition, {
            configuration: ctx.configuration,
            entries: [
                ...ctx.entries.filter(e => e.screen.id !== screen.id),
                entry,
            ],
        }));
        return conditionMet;
    };

    React.useEffect(() => {
        const completed = entry.values.reduce((acc, { value }, i) => {
            const field = fields[i];
            const conditionMet = evaluateFieldCondition(fields[i]);
            if (conditionMet && !field.optional && !value) return false;
            // if (!(field.condition && field.optional && value)) acc = false;
            return acc;
        }, true);

        const hasErrors = entry.values.filter(v => v.error).length;
        onChange(hasErrors || !completed ? undefined : entry);
    }, [entry]);

    React.useEffect(() => {
    if (canAutoFill && autoFill.session) {
        const _setEntry = prev => {
        return {
            ...prev,
            values: prev.values.map(f => {
            const autoFillObj = autoFill.session.data.entries[f.key];
            let autoFillVal = null;
            if (autoFillObj) {
                autoFillVal = autoFillObj.values.value[0];
                if (autoFillVal) {
                // if ((autoFillObj.type === 'date') || (autoFillObj.type === 'datetime') || (autoFillObj.type === 'time')) {
                //   autoFillVal = new Date(autoFillVal);
                // }
                if (autoFillObj.type === 'number') autoFillVal = `${autoFillVal}`;
                }
            }
            return { ...f, value: autoFillVal };
            }),
        };
        };
        setEntry(_setEntry);
        setEntryCache(_setEntry);
    }
    }, [canAutoFill, autoFill]);    

    return (
        <>
            <ScrollView>
                {fields.map((f, i) => {
                    return (
                        <React.Fragment key={i}>
                            {(() => {
                                let Component: React.ComponentType<ScreenFormFieldComponentProps> = null;
                                switch (f.type) {
                                    case fieldsTypes.DATE:
                                        Component = FieldDate;
                                        break;
                                    case fieldsTypes.DATETIME:
                                        Component = DateTime;
                                        break;
                                    case fieldsTypes.TEXT:
                                        Component = FieldText;
                                        break;
                                    case fieldsTypes.NUMBER:
                                        Component = FieldNumber;
                                        break;
                                    case fieldsTypes.TIME:
                                        Component = Time;
                                        break;
                                    case fieldsTypes.PERIOD:
                                        Component = Period;
                                        break;
                                    case fieldsTypes.DROPDOWN:
                                        Component = DropDown;
                                        break;
                                    default:
                                        break;
                                }

                                const conditionMet = evaluateFieldCondition(f);

                                const onChange = (v, params?: any) => {
                                    const value = { value: v, ...params };
                                    _onChange(i, value);
                                    setCache(i, value);
                                };

                                const value = entry.values[i].value;
                                const valueObject = entry.values[i];

                                return !Component ? null : (
                                    <Field
                                        {...props}
                                        field={f}
                                        setCache={v => setCache(i, { value: v })}
                                        conditionMet={conditionMet}
                                        value={value}
                                        valueCache={entryCache.values[i].value}
                                        onChange={onChange}
                                    >
                                        <Br />
                                        <Text color={valueObject.error ? 'error' : 'textPrimary'}>
                                            {`${f.label} ${f.optional ? '' : ' *'}`}
                                        </Text>
                                        <Component 
                                            {...props} 
                                            field={f} 
                                            conditionMet={conditionMet}
                                            value={value}
                                            valueObject={valueObject}
                                            onChange={onChange}
                                            form={entry}
                                        />
                                    </Field>
                                );
                            })()}
                        </React.Fragment>
                    );
                })}
            </ScrollView>
        </>
    );
}
