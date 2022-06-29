import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from '../components/DiagnosesList';

export default function AgreeDisagree() {
  const { props, goBack, hcwDiagnoses, diagnosesEntry, } = useDiagnosisContext();

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
        title={`${props.screen.data.title2 || ''}`}
        // instructions={`${props.screen.data.instructions2 || ''}`}
      />

      <ScrollView>
        <Content>
          <DiagnosesList
            divider={false}
            sortable={false}
            canAgreeDisagree={false}
            canDelete
            title="HCW Diagnoses"
            // subtitle="Please order the diagnoses by priority"
            filter={d => d.isHcwDiagnosis}
            instructions={props.screen.data.hcwDiagnosesInstructions}
          />

          <DiagnosesList
            divider
            sortable={false}
            title="Suggested Diagnoses"
            canDelete={false}
            // subtitle="Please order the diagnoses by priority"
            filter={d => !d.isHcwDiagnosis && (d.how_agree !== 'No')}
            instructions={props.screen.data.suggestedDiagnosesInstructions}
            emptyListMessage="No suggested diagnoses"
          />

          <DiagnosesList
            divider
            sortable={false}
            canDelete={false}
            title="Diagnoses rejected"
            filter={d => !d.isHcwDiagnosis && (d.how_agree === 'No')}
          />
        </Content>
      </ScrollView>
    </>
  );
}
