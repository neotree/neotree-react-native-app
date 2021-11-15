import React from 'react';
import { ScrollView } from 'react-native';
import { View, Content } from '@/components/ui';
import { ScreenDiagnosisComponentProps } from '../../../types';
import { Fab } from '../../Fab';
import { DiagnosesList } from './DiagnosesList';
import { useScriptContext } from '../../../Context';

export function AgreeDisagree({ value }: ScreenDiagnosisComponentProps) {
    const { activeScreen, getSuggestedDiagnoses } = useScriptContext();
    const items = activeScreen.data.metadata?.items || [];

    const allSuggested = getSuggestedDiagnoses();

    const hcwDiagnoses = value.values
        .filter(v => items.map(item => item.label).includes(v?.diagnosis?.name))
        .map(v => v?.diagnosis);
    const suggested = value.values
        .filter(v => !items.map(item => item.label).includes(v?.diagnosis?.name) && v?.diagnosis?.how_agree !== 'No')
        .map(v => v?.diagnosis);
    const rejected = value.values
        .filter(v => !items.map(item => item.label).includes(v?.diagnosis?.name) && v?.diagnosis?.how_agree === 'No')
        .map(v => v?.diagnosis);

    console.log(hcwDiagnoses);
    
    return (
        <>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <Content>
                        <DiagnosesList
                            divider
                            canAgreeDisagree={false}
                            canDelete={false}
                            title="HCW Diagnoses"
                            subtitle="Please order the diagnoses by priority"
                            diagnoses={hcwDiagnoses}
                        />

                        <DiagnosesList
                            divider
                            title="Suggested Diagnoses"
                            subtitle="Please order the diagnoses by priority"
                            diagnoses={suggested}
                        />

                        <DiagnosesList
                            divider
                            title="Diagnoses rejected"
                            diagnoses={rejected}
                        />
                    </Content>
                </ScrollView>
            </View>
            <Fab onPress={() => {}} />
        </>
    );
}
