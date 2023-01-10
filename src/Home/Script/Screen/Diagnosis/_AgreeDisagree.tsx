import React from 'react';
import { Box } from '../../../../components';
import * as types from '../../../../types';
import { useContext } from '../../Context';
import { DiagnosesList } from './components/DiagnosesList';

type AgreeDisagreeProps = types.DiagnosisSectionProps & {
    
};

export function AgreeDisagree(props: AgreeDisagreeProps) {
    const ctx = useContext();

    return (
        <Box>
            <DiagnosesList
                {...props}
                divider={false}
                sortable={false}
                canAgreeDisagree={false}
                canDelete
                title="HCW Diagnoses"
                // subtitle="Please order the diagnoses by priority"
                filter={d => d.isHcwDiagnosis}
                instructions={ctx?.activeScreen?.data?.hcwDiagnosesInstructions}
            />

            <DiagnosesList
                {...props}
                divider
                sortable={false}
                title="Suggested Diagnoses"
                canDelete={false}
                // subtitle="Please order the diagnoses by priority"
                filter={d => !d.isHcwDiagnosis && (d.how_agree !== 'No')}
                instructions={ctx?.activeScreen?.data?.suggestedDiagnosesInstructions}
                emptyListMessage="No suggested diagnoses"
            />

            <DiagnosesList
                {...props}
                divider
                sortable={false}
                canDelete={false}
                title="Diagnoses rejected"
                filter={d => !d.isHcwDiagnosis && (d.how_agree === 'No')}
            />
        </Box>
    );
}
