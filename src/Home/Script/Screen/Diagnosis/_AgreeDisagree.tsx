import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import * as types from '../../../../types';
import { DiagnosesList } from './components/DiagnosesList';
import { ScrollView } from 'react-native';

type AgreeDisagreeProps = types.DiagnosisSectionProps & {
    
};

export function AgreeDisagree(props: AgreeDisagreeProps) {
    const { activeScreen, } = useScriptContext();

    return (
        <ScrollView>
            <DiagnosesList
                {...props}
                divider={false}
                sortable={false}
                canAgreeDisagree={false}
                canDelete
                title="HCW Diagnoses"
                // subtitle="Please order the diagnoses by priority"
                filter={d => d.isHcwDiagnosis}
                instructions={activeScreen?.data?.hcwDiagnosesInstructions}
                scrollable={false}
            />

            <DiagnosesList
                {...props}
                divider
                sortable={false}
                title="Suggested Diagnoses"
                canDelete={false}
                // subtitle="Please order the diagnoses by priority"
                filter={d => !d.isHcwDiagnosis && (d.how_agree !== 'No')}
                instructions={activeScreen?.data?.suggestedDiagnosesInstructions}
                emptyListMessage="No suggested diagnoses"
                scrollable={false}
            />

            <DiagnosesList
                {...props}
                divider
                sortable={false}
                canDelete={false}
                title="Diagnoses rejected"
                filter={d => !d.isHcwDiagnosis && (d.how_agree === 'No')}
                scrollable={false}
            />
        </ScrollView>
    );
}
