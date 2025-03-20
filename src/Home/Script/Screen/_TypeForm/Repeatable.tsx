import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '../../../../components';

type RepeatableProps = {
    collectionName: string;
    collectionField: string;
    returnable: React.ReactNode;
};

const Repeatable = ({ collectionName, collectionField, returnable }: RepeatableProps) => {
    const [entryForms, setEntryForms] = useState<{ id: number; isCollapsed: boolean; values: any }[]>([]);

    const addNewForm = () => {
        const newForm = { id: Date.now(), isCollapsed: false, values: {} };
        setEntryForms(prev => [
            ...prev.map(form => ({ ...form, isCollapsed: true })), // Collapse all previous forms
            newForm, // Add new form
        ]);
    };

    const toggleCollapse = (id: number) => {
        setEntryForms(prev =>
            prev.map(form =>
                form.id === id ? { ...form, isCollapsed: !form.isCollapsed } : form
            )
        );
    };

    const updateFormValues = (id: number, newValues: any) => {
        setEntryForms(prev =>
            prev.map(form =>
                form.id === id ? { ...form, values: { ...form.values, ...newValues } } : form
            )
        );
    };

    const removeForm = (id: number) => {
        setEntryForms(prev => prev.filter(form => form.id !== id));
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {entryForms.map((form) => {
                    const hasNameField = !!form.values[collectionField]; // Check if the field exists
                    return (
                        <View key={form.id} style={styles.formContainer}>
                            <View style={styles.header}>
                                {hasNameField && ( // Show remove button only if the field exists
                                    <Button
                                        style={{ backgroundColor: 'red', margin: 2 }}
                                        onPress={() => removeForm(form.id)}
                                    >
                                        <Text
                                            color="error"
                                            style={{ fontWeight: '300', color: 'white' }}
                                            textAlign="center"
                                        >
                                            Remove
                                        </Text>
                                    </Button>
                                )}
                                <Button
                                    onPress={() => toggleCollapse(form.id)}
                                    disabled={!hasNameField} // Disable toggle if the field is missing
                                >
                                    <Text style={styles.headerText}>
                                        {hasNameField ? form.values[collectionField] : `New ${collectionName}`}
                                    </Text>
                                </Button>
                            </View>
                            {!form.isCollapsed && (
                                <View style={styles.formContent}>
                                    {React.cloneElement(returnable as React.ReactElement, {
                                        onChange: (val: any) => {
                                            console.log('onChange called with:', val); // Debugging log
                                            updateFormValues(form.id, val);
                                        },
                                        initialValues: form.values, // Pass initial values to the form
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
            <Button
                size="l"
                style={{
                    backgroundColor: 'blue',
                    margin: 0,
                    right: 10,
                    padding: 10,
                    width: 100,
                    borderRadius: 10,
                    position: 'static',
                }}
                onPress={addNewForm}
            >
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
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    headerText: {
        fontWeight: 'bold',
    },
    formContent: {
        marginTop: 5,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
});

export default Repeatable;