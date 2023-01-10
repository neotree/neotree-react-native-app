import React from 'react';
import { View } from 'react-native';
import { Box, Text } from '../../../../../components';
import * as types from '../../../../../types';

type DiagnosesListProps = types.DiagnosisSectionProps & {
    filter: any; 
    title: any; 
    subtitle: any; 
    divider: any; 
    canAgreeDisagree: any; 
    canDelete: any;
    instructions: any; 
    emptyListMessage: any;
    itemWrapper: any;
};

export function DiagnosesList({
    filter, 
    title, 
    subtitle, 
    divider, 
    canAgreeDisagree, 
    canDelete,
    instructions, 
    emptyListMessage,
    itemWrapper,
    setHcwDiagnoses,
    diagnoses,
    setDiagnoses,
}: DiagnosesListProps) {
    const displayedDiagnoses = diagnoses.filter((d, i) => filter ? filter(d, i) : true);

    if (!displayedDiagnoses.length) {
        if (emptyListMessage) {
            return (
            <Box style={{ marginBottom: 30, marginTop: 20 }}>
                <Text color="textDisabled" textAlign="center" variant="caption">{emptyListMessage}</Text>
            </Box>
            );
        }
        return null;
    }

    return (
        <Box>
            {!!instructions && (
                <Box style={{ marginBottom: 30, marginTop: 20 }}>
                    <Text color="primary">Instructions</Text>
                    <Text variant="caption">{instructions}</Text>
                </Box>
            )}

            <Box
                style={{
                    padding: 10,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: '#999',
                }}
            >
                <Text
                    color="textDisabled"
                    textTransform="uppercase"
                    fontWeight="bold"
                >{title}</Text>

                {!!subtitle && <Text variant="caption" color="textDisabled">{subtitle}</Text>}
            </Box>

            {diagnoses.map((item, index) => {
                if (filter && !filter(item, index)) return null;
                const key = item.id || index;

                const card = (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View>
                            <Text>{item.customValue || item.name}</Text>
                            {!!item.expressionMeaning && <Text variant="caption" style={{ color: '#999' }}>{item.expressionMeaning}</Text>}
                        </View>

                        <View style={{ marginLeft: 'auto' }} />

                        {canAgreeDisagree !== false && (
                            <Diagnosis
                                setDiagnosis={s => {
                                    setDiagnoses(diagnoses.map((d, i) => {
                                        if (i !== index) return d;
                                        return { ...d, ...s };
                                    }));
                                }}
                                diagnosis={item}
                            />
                        )}

                        <View style={{ marginHorizontal: 5 }} />

                        {canDelete !== false && (
                        <Button
                        transparent
                        onPress={() => {
                        const deleteDiagnosis = () => {
                        setDiagnoses(diagnoses.filter((d, i) => i !== index));
                        _setHcwDiagnoses(hcwDiagnoses => hcwDiagnoses.filter((d, i) => d.diagnosis.name !== item.name));
                        };
                        Alert.alert(
                        'Delete diagnosis',
                        'Are you sure?',
                        [
                        {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel'
                        },
                        {
                        text: 'Yes',
                        onPress: () => deleteDiagnosis()
                        }
                        ],
                        { cancelable: false }
                        );
                        }}
                        >
                        <MaterialIcons 
                        size={30} // {24} 
                        color="#999" 
                        name="delete" 
                        />
                        </Button>
                        )}
                    </View>
                );

                return (
                    <View key={key} style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, }}>
                        {itemWrapper ? itemWrapper(card, { item, index }) : card}
                    </View>
                );
            })}
        </Box>
    );
}
