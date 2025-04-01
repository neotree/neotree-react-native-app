import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '../../../../components';
import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField } from './_Period';
import { TimeField } from './_Time';
import { fieldsTypes } from '../../../../constants';
import { backgroundColor } from '@shopify/restyle';

type FieldType = "number" | "date" | "datetime" | "dropdown" | "period" | "text" | "time";

type Field = {
    key: string;
    type: FieldType;
    label: string;
};

type Repeatable = Record<string, any>;

type RepeatableProps = {
    collectionName: string;
    collectionField: string;
    fields: Field[];
    onChange: (updatedRepeatables: Record<string, Repeatable[]>) => void;
    evaluateCondition: (f: any) => boolean;
    allValues: any;
};

const Repeatable = ({ collectionName, collectionField, fields, onChange, evaluateCondition, allValues }: RepeatableProps) => {
    const [forms, setForms] = useState<{
        id: number;
        isCollapsed: boolean;
        values: Record<string, any>;
        isComplete: boolean;
    }[]>([]);

    const [disabled,setDisabled] =  useState(false)

    useEffect(() => {
        if (forms.length === 0) {
            addNewForm();
        }
    }, []);

    const addNewForm = () => {
        const initialValues = fields.reduce((acc, field) => {
            acc[field.key] = ''; // Initialize with empty values
            return acc;
        }, {} as Record<string, any>);

        const newForm = {
            id: Date.now(),
            isCollapsed: false,
            values: initialValues,
            isComplete: false,
        };

        setForms(prev => [
            ...prev.map(form => ({ ...form, isCollapsed: true })), // Collapse previous forms
            newForm,
        ]);
    };

    const removeForm = (id: number) => {
        const updatedForms = forms.filter(form => form.id !== id);
        setForms(updatedForms);
        notifyParent(updatedForms);
    };

    const formatFieldLabel = (value:any)=>{

      if(value){
       return value['valueText'] || value['value'] 
      }else{
       return ''
      }
    }

    const handleChange = (id: number, key: string, value: any) => {
        setForms(prev => prev.map(form => {
            console.log(form.id,id)
            if (form.id !== id) return form;

            const newValues = { ...form.values, [key]: value };
       
            console.log("----NEW VALS...",newValues)
            //FILTER OUT CONDITION MET AND SKIPPABLE FIELDS
            const isComplete = fields.every(field => {
                const val = newValues[field.key];
                return val !== undefined && val !== null && val !== '';
            });

            setDisabled(forms.filter(f=>!f.isComplete).length>0)

            return { ...form, values: newValues, isComplete };
        }));
    };

    const notifyParent = (formsList = forms) => {
        const completedForms = formsList
            .filter(form => form.isComplete)
            .map(({ values, id }) => ({ ...values, id }));

        onChange({ [collectionName]: completedForms });
    };


    const renderFieldComponent = (field: Field, formId: number, value: any, index: number) => {
        const conditionMet = evaluateCondition(field);
        
        const fieldProps = {
            field,
            fieldIndex: index,
            entryValue: value,
            formValues: [],
            allValues,
            repeatables: true,
            conditionMet,
            onChange: (val: any) => handleChange(formId, field.key, val)
        };


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
            case  fieldsTypes.TEXT:
                return <TextField key={field.key} {...fieldProps} />;
            case  fieldsTypes.TIME:
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
                                style={{ backgroundColor: 'maroon', margin: 2 }}
                                onPress={() => removeForm(form.id)}
                            >
                                <Text style={{ fontWeight: '300', color: 'white' }}>Remove</Text>
                            </Button>
                            <Button 
                            style={{width:'80%',margin:'auto',alignItems:'center'}}
                            onPress={() => setForms(prev => 
                                prev.map(f => f.id === form.id 
                                    ? { ...f, isCollapsed: !f.isCollapsed } 
                                    : f
                                ))}
                            >
                                <Text style={styles.headerText}>
                                    {formatFieldLabel(form.values[collectionField])}
                                </Text>
                            </Button>
                        </View>
                        {!form.isCollapsed && (
                            <View style={styles.formContent}>
                                {fields.map((field, i) => 
                                    renderFieldComponent(field, form.id, form.values[field.key], i)
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
        width:'100%',
        borderRadius: 5,
    },
    headerText: {
        fontWeight: 'bold',
        color:'white',
    },
    formContent: {
        marginTop: 5,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
    addButton: {
        color:'white',
        padding: 10,
        right: 10,
        width: 100,
        borderRadius: 10,
    },
});

export default Repeatable;