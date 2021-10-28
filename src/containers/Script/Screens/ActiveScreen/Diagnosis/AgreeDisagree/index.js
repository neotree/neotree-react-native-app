import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from './DiagnosesList';

export default function AgreeDisagree() {
  const { props, goBack, hcwDiagnoses, diagnosesEntry, } = useDiagnosisContext();

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
      />

      <ScrollView>
        <Content>
          <DiagnosesList
            divider
            canAgreeDisagree={false}
            canDelete={false}
            title="HCW Diagnoses"
            subtitle="Please order the diagnoses by priority"
            filter={d => hcwDiagnoses.map(d => d.name).includes(d.name)}
          />

          <DiagnosesList
            divider
            title="Suggested Diagnoses"
            subtitle="Please order the diagnoses by priority"
            filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree !== 'No')}
          />

          <DiagnosesList
            divider
            title="Diagnoses rejected"
            filter={d => !hcwDiagnoses.map(d => d.name).includes(d.name) && (d.how_agree === 'No')}
          />
        </Content>
      </ScrollView>
    </>
  );
}
