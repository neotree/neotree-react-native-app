import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from './DiagnosesList';
import AddDiagnosis from './AddDiagnosis';

export default function SelectDiagnoses() {
  const { props } = useDiagnosisContext();

  return (
    <>
      <Header {...props} />

      <ScrollView>
        <Content>
          <DiagnosesList
            title="Diagnoses made"
            subtitle="Please order the diagnoses by priority"
            filter={d => d.how_agree !== 'No'}
          />

          <AddDiagnosis />

          <View style={{ marginVertical: 50 }} />

          <DiagnosesList
            title="Diagnoses rejected"
            filter={d => d.how_agree === 'No'}
          />
        </Content>
      </ScrollView>
    </>
  );
}
