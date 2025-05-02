import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '../../../../components';
import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField, dateToValueText } from './_Period';
import { TimeField } from './_Time';
import { fieldsTypes } from '../../../../constants';



type Repeatable = Record<string, any>;


type RepeatableProps = {
    collectionName: string;
    collectionField: string;
    fields: any[];
    onChange: (updatedRepeatables: Record<string, Repeatable[]>, key: string) => void;
    evaluateCondition: (f: any, form?: any) => boolean;
    allValues: any;
};
type FormItem = {
    createdAt: Date;
    id: number;
    isCollapsed: boolean;
    values: Record<string, any>;
    isComplete: boolean;
    requiredComplete: boolean;
}


const Repeatable = ({ collectionName, collectionField, fields, onChange, evaluateCondition, allValues }: RepeatableProps) => {


    const transformAllValuesToForms = (allValues: Array<Record<string, any>>): FormItem[] => {
        if (!allValues?.length) return [];

        return allValues.map((item, index) => {

            const { createdAt, id, ...dynamicFields } = item;

            const values: Record<string, any> = transformToFullFieldObject({ ...dynamicFields });

            const isComplete = fields.every(field => {
                const val = values[field.key];

                const conditionMet = evaluateCondition(field, index)
                if (!conditionMet) {
                    return true
                }

                return (val !== undefined
                    && val !== null
                    && val !== ''
                    && val['value'] !== undefined
                    && val['value'] !== null
                    && val['value'] !== '');
            });

            const requiredComplete = fields.filter(f => !f.editable).every(field => {
                const val = values[field.key];
                if (val['value'] === 'other') {
                    const otherField = fields.find(f => String(f.key).toLocaleLowerCase() === String('other' + field.key).toLocaleLowerCase())

                    if (otherField) {
                        return values[otherField?.key]?.['value'] || values[otherField]?.['value'] || ''
                    }
                }

                const conditionMet = evaluateCondition(field, index)
                if (!conditionMet) {
                    return true
                }

                return (val !== undefined
                    && val !== null
                    && val !== ''
                    && val['value'] !== undefined
                    && val['value'] !== null
                    && val['value'] !== ''
                )
            });

            return {
                createdAt: new Date(createdAt),
                id,
                isCollapsed: true,
                values,
                isComplete,
                requiredComplete
            };
        });
    };

    const [forms, setForms] = useState<FormItem[]>(() => transformAllValuesToForms(allValues));
    const [disabled, setDisabled] = useState(forms.filter(f => !f.requiredComplete).length > 0)

    useEffect(() => {
        const shouldDisable = forms.some(f => !f.requiredComplete);
        setDisabled(shouldDisable);
    }, [forms]);

    useEffect(() => {
        addNewForm()
    }, [])
    const addNewForm = () => {
        const hasUncollapsedOrIncomplete = forms.some(f => !f.requiredComplete);
        if (hasUncollapsedOrIncomplete) return;

        const initialValues = fields.reduce((acc, field) => {
            acc[field.key] = '';
            return acc;
        }, {} as Record<string, any>);

        const newForm: FormItem = {
            createdAt: new Date(),
            id: Date.now() + Math.floor(Math.random() * 1000),
            isCollapsed: false,
            values: initialValues,
            isComplete: false,
            requiredComplete: false,
        };

        const collapsedForms = forms.map(f => ({
            ...f,
            isCollapsed: true,
        }));

        setForms([...collapsedForms, newForm]);
    };



    useEffect(() => {
        setDisabled(forms?.filter(f => !f.requiredComplete).length > 0);
    })

    const removeForm = (id: number) => {
        const updatedForms = forms.filter(form => form.id !== id);
        setForms(updatedForms);

        notifyParent(updatedForms);
    };

    const formatFieldLabel = (value: any, form: any) => {

        if (value) {
            const field = fields.find(field => field.key === collectionField)
            if (field && field.type === 'dropdown') {
                if (value['value'] === 'other') {
                    const otherField = fields.find(f => String(f.key).toLocaleLowerCase() === String('other' + field.key).toLocaleLowerCase())

                    if (otherField) {
                        return form.values[otherField?.key]?.['value'] || form.values[otherField]?.['value'] || ''
                    } else {
                        return ''
                    }
                }
            }
            return value['valueText'] || value['value']
        } else {
            return ''
        }
    }

    const handleChange = (id: number, key: string, value: any, field: any) => {

        const updatedForms = forms.map((form) => {
            if (form.id !== id) return form;
            const enhancedValue = {
                ...value,
                printable: field.printable,
                label: field.label,
                prePopulate: field.prePopulate
            };
            const newValues = { ...form.values, [key]: enhancedValue };

            const isComplete = fields.every(field => {
                const val = newValues[field.key];
                const conditionMet = form ? evaluateCondition(field, forms.indexOf(form)) : true
                if (!conditionMet) {
                    return true
                }
                return (val !== undefined
                    && val !== null
                    && val !== ''
                    && val['value'] !== undefined
                    && val['value'] !== null
                    && val['value'] !== '')
            });

            const requiredComplete = fields.filter(f => !f.editable).every(field => {
                const val = newValues[field.key];
                if (val['value'] === 'other') {
                    const otherField = fields.find(f => String(f.key).toLocaleLowerCase() === String('other' + field.key).toLocaleLowerCase())

                    if (otherField) {
                        return newValues[otherField?.key]?.['value'] || newValues[otherField]?.['value'] || ''
                    }
                }
                const conditionMet = form ? evaluateCondition(field, forms.indexOf(form)) : true
                if (!conditionMet) {
                    return true
                }
                return (val !== undefined
                    && val !== null
                    && val !== ''
                    && val['value'] !== undefined
                    && val['value'] !== null
                    && val['value'] !== '')
                    ;
            });

            return { ...form, values: newValues, isComplete, requiredComplete };
        });
        setDisabled(updatedForms.filter(f => !f.requiredComplete).length > 0);
        setForms(updatedForms);

        notifyParent(updatedForms);
    };

    const notifyParent = (formsList = forms) => {


        const completedForms = formsList
            .map(({ values, id, createdAt,requiredComplete }) => ({ ...values, id, createdAt,requiredComplete }));

        onChange({ [collectionName]: completedForms }, collectionName);
    }


    const dateIsToday = (date: Date) => {
        const today = new Date()
        return (date.getDate() == today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() == today.getFullYear())
    }

    // Utility to get valueLabel and valueText for dropdowns
    function getValueLabelAndText(field: any, value: any) {
        const opts = (field.values || '').split('\n')
            .map((v = '') => v.trim())
            .filter((v: any) => v)
            .map((v: any) => {
                v = v.split(',');
                return { value: v[0], label: v[1], };
            });

        if (field.type === 'dropdown' && Array.isArray(opts)) {
            const match = opts.find((v: any) => v.value === value);
            if (match) {
                return {
                    valueLabel: match.label,
                    valueText: match.label,
                    exportLabel: match.label,
                    exportValue: value
                };
            }
        }
        return null;
    }

    function getPeriodValueText(field: any, value: any) {
        const formatedValue = dateToValueText(value, field.format)
        return {
            valueLabel: formatedValue,
            valueText: formatedValue,
            exportLabel: formatedValue,
            exportValue: formatedValue
        };

    }

    function transformToFullFieldObject(partial: any) {
        const transformed: any = {};
        for (const key in partial) {
            let valueObj = partial[key];
            const field = fields.filter(f => f.key === key)[0];

            if (valueObj?.value === '[object Object]') {
                valueObj.value = {};
            }

            if (!field) continue;

            const base = Object.keys(valueObj).length > 0 ? {
                ...{ 'label': field.label },
                ...{ 'exportType': field.type },
                ...valueObj,
            } : {};

            if (field.type === 'dropdown') {
                const dropdownInfo = getValueLabelAndText(field, valueObj.value);
                if (dropdownInfo !== null)
                    Object.assign(base, dropdownInfo);
            } else if (field.type === 'period') {
                const periodInfo = getPeriodValueText(field, valueObj.value);
                if (periodInfo && periodInfo !== null)
                    Object.assign(base, periodInfo);
            }

            transformed[key] = base;
        }

        return transformed;
    }



    const renderFieldComponent = (field: any, formId: number, value: any, index: number, createdAt: Date) => {
        const form = forms.find(f => f.id === formId)
        const formIndex = form ? forms.indexOf(form) : 0
        const conditionMet = form ? evaluateCondition(field, forms.indexOf(form)) : true
        const editable = field.editable || dateIsToday(createdAt)
        const fieldProps = {
            field,
            fieldIndex: index,
            entryValue: value,
            formValues: [],
            allValues,
            repeatable: true,
            conditionMet,
            editable,
            formIndex: formIndex,

            onChange: (val: any) => handleChange(formId, field.key, val, field)
        }
        switch (field.type) {
            case fieldsTypes.NUMBER:
                return <NumberField key={field.key} {...fieldProps} />;
            case fieldsTypes.DATE:
            case fieldsTypes.DATETIME:
                return <DateField key={field.key} {...fieldProps} />;
            case fieldsTypes.DROPDOWN:
                return <DropDownField key={field.key} {...fieldProps} />;
            case fieldsTypes.PERIOD:
                return <PeriodField key={field.key} {...fieldProps} />;
            case fieldsTypes.TEXT:
                return <TextField key={field.key} {...fieldProps} />;
            case fieldsTypes.TIME:
                return <TimeField key={field.key} {...fieldProps} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {forms.map((form) => (
                    <View key={form.id} style={styles.formContainer}>
                        <View style={styles.header}>
                            <Button
                                disabled={!dateIsToday(form.createdAt)}
                                style={{ backgroundColor: dateIsToday(form.createdAt) ? 'maroon' : 'pink', margin: 2 }}
                                onPress={() => removeForm(form.id)}
                            >
                                <Text style={{ fontWeight: '300', color: 'white' }}>Remove</Text>
                            </Button>
                            <Button
                                style={{
                                    width: '80%',
                                    margin: 'auto',
                                    alignItems: 'center',
                                    backgroundColor: form.isComplete ? 'grey' : 'rgba(112,164,135,255)',
                                }}
                                onPress={() => {
                                    setForms(prev =>
                                        prev.map(f =>
                                            f.id === form.id
                                                ? { ...f, isCollapsed: !f.isCollapsed }
                                                : { ...f, isCollapsed: true }
                                        )
                                    );
                                }}
                            >
                                <Text style={styles.headerText}>
                                    {formatFieldLabel(form.values[collectionField], form)}
                                </Text>
                            </Button>

                        </View>
                        {!form.isCollapsed && (
                            <View style={styles.formContent}>
                                {fields.map((field, i) =>
                                    renderFieldComponent(field, form.id, form.values[field.key], i, form.createdAt)
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
            <Button
                disabled={disabled}
                style={styles.addButton}

                onPress={addNewForm}>
                <Text style={{ fontWeight: '300', color: 'white' }}>Add New</Text>
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    formContainer: {
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff0f0',
        padding: 10,
        width: '100%',
        borderRadius: 5,
    },
    headerText: {
        fontWeight: 'bold',
        color: 'white',
    },
    formContent: {
        marginTop: 5,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
    addButton: {
        color: 'white',
        padding: 10,
        right: 10,
        width: 100,
        borderRadius: 10,
    },
});

export default Repeatable;