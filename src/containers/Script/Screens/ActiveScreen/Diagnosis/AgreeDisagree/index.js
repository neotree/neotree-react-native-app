import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import colorStyles from '@/styles/colorStyles';
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
            divider
            sortable={false}
            canAgreeDisagree={false}
            canDelete
            title="HCW Diagnoses"
            // subtitle="Please order the diagnoses by priority"
            filter={d => hcwDiagnoses.map(d => d.name).includes(d.name)}
          />

          {!!props.screen.data.instructions2 && (
            <>
              <Text style={[colorStyles.primaryColor]}>Instructions</Text>
              <Text variant="caption">{instructions}</Text>
            </>
          )}

          <DiagnosesList
            divider
            sortable={false}
            title="Suggested Diagnoses"
            canDelete={false}
            // subtitle="Please order the diagnoses by priority"
            filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree !== 'No')}
          />

          <DiagnosesList
            divider
            sortable={false}
            canDelete={false}
            title="Diagnoses rejected"
            filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree === 'No')}
          />
        </Content>
      </ScrollView>
    </>
  );
}
