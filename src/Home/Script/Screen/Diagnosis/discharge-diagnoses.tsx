import React from 'react';
import { FlatList, View } from 'react-native';
import { useScriptContext } from '@/src/contexts/script';
import { Box, Text, Content, OverlayLoader } from '../../../../components';
import * as types from '../../../../types';

type SortPriorityProps = types.DiagnosisSectionProps;

export function DischargeDiagnoses({ getDefaultDiagnosis }: SortPriorityProps) {
    const [mounted, setMounted] = React.useState(false);
    const { nuidSearchForm, setEntryValues, } = useScriptContext();
    const matchedDiagnoses: types.DischargeDiagnosis[] = nuidSearchForm.filter(f => f.results)[0]?.results?.session?.data?.diagnoses || [];

    React.useEffect(() => {
        setTimeout(() => {
            if (!mounted) {
                setMounted(true);
                setEntryValues(matchedDiagnoses.map(item => {
                    const [key] = Object.keys(item);
                    const [value] = Object.values(item);

                    return {
                        label: value.diagnosis,
                        key,
                        value: key,
                        valueText: value.diagnosis,
                        type: 'diagnosis',
                        dataType: 'diagnosis',
                        diagnosis: {
                            ...getDefaultDiagnosis({
                                name: value.diagnosis,
                                key,
                                how_agree: value.hcw_agree,
                                hcw_follow_instructions: value.hcw_follow_instructions,
                                hcw_reason_given: value.hcw_reason_given,
                                suggested: value.Suggested,
                                priority: value.Priority,
                            })
                        },
                    };
                }));
            }
        }, 0);
    }, [mounted, matchedDiagnoses, setEntryValues, getDefaultDiagnosis]);

    if (!mounted) return <OverlayLoader transparent />;

    return (
        <FlatList
            data={matchedDiagnoses}
            keyExtractor={item => Object.keys(item)[0]}
            ListHeaderComponent={(
                <Content>
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
                        >Compiled Admission Diagnoses</Text>
                    </Box>
                </Content>
            )}
            ListEmptyComponent={(
                <Content>
                    <Box style={{ marginBottom: 30, marginTop: 20 }}>
                        <Text color="textDisabled" textAlign="center">No compiled admission diagnoses</Text>
                    </Box>
                </Content>
            )}
            renderItem={({ item }) => {
                const [d] = Object.values(item);

                return (
                    <Content>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1, }}>
                                <Text>{d.diagnosis}</Text>
                                <Text variant="caption" style={{ color: '#999' }}>{d.Suggested ? 'Suggested' : 'Selected by HCW'}</Text>
                            </View>
                            {!!d.Suggested && (
                                <View>
                                    <Text 
                                        variant="caption" 
                                        style={{ color: d.hcw_agree === 'Yes' ? '#16a085' : '#e74c3c' }}
                                    >{d.hcw_agree === 'Yes' ? 'HCW agreed' : 'HCW disagreed'}</Text>
                                </View>
                            )}
                        </View>
                    </Content>
                );
            }}
        />
    );
}
