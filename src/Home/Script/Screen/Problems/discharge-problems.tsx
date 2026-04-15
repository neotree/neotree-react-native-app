import React from 'react';
import { FlatList, View } from 'react-native';
import { useScriptContext } from '@/src/contexts/script';
import { Box, Text, Content, OverlayLoader } from '../../../../components';
import * as types from '../../../../types';

type SortPriorityProps = types.ProblemSectionProps;

export function DischargeProblems({ getDefaultProblem }: SortPriorityProps) {
    const [mounted, setMounted] = React.useState(false);
    const { nuidSearchForm, setEntryValues, } = useScriptContext();
    const matchedProblems = React.useMemo(() => {
        const matches: types.DischargeProblem[] = (nuidSearchForm.filter(f => f.results)[0]?.results?.session?.data?.problems || []);
        return matches.sort((a, b) => {
            const [v1] = Object.values(a);
            const [v2] = Object.values(b);
            return (v1.hcw_agree === 'Yes' ? -1 : 1) - (v2.hcw_agree === 'Yes' ? -1 : 1);
        });
    }, [nuidSearchForm]);

    React.useEffect(() => {
        setTimeout(() => {
            if (!mounted) {
                setMounted(true);
                setEntryValues(matchedProblems.map(item => {
                    const [key] = Object.keys(item);
                    const [value] = Object.values(item);

                    const valueText = value.value || value.problem;

                    return {
                        label: value.problem,
                        key,
                        value: key,
                        valueText,
                        type: 'problem',
                        dataType: 'problem',
                        problem: {
                            ...getDefaultProblem({
                                name: value.problem,
                                key,
                                value: valueText,
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
    }, [mounted, matchedProblems, setEntryValues, getDefaultProblem]);

    if (!mounted) return <OverlayLoader transparent />;

    return (
        <FlatList
            data={matchedProblems}
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
                        >Compiled Admission Problems</Text>
                    </Box>
                </Content>
            )}
            ListEmptyComponent={(
                <Content>
                    <Box style={{ marginBottom: 30, marginTop: 20 }}>
                        <Text color="textDisabled" textAlign="center">No admission problems available</Text>
                    </Box>
                </Content>
            )}
            renderItem={({ item }) => {
                const [d] = Object.values(item);

                if (d.hcw_agree !== 'Yes') return null;

                return (
                    <Content>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1, }}>
                                <Text>{d.value || d.problem}</Text>
                                <Text variant="caption" style={{ color: '#999' }}>{d.Suggested ? 'Suggested' : ''}</Text>
                            </View>
                            <View>
                                <Text 
                                    variant="caption" 
                                    style={{ color: d.Suggested ? '#16a085' : '#f39c12' }}
                                >{d.Suggested ? 'HCW agreed' : 'HCW selected'}</Text>
                            </View>
                        </View>
                    </Content>
                );
            }}
        />
    );
}
