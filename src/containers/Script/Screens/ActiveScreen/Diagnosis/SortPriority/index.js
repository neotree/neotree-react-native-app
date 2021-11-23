import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from '../components/DiagnosesList';

export default function SortPriority() {
  const { props, diagnoses, setDiagnoses, goBack } = useDiagnosisContext();

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
        title={`${props.screen.data.title3 || ''}`}
      />

      <ScrollView>
        <Content>
          <DiagnosesList
            divider
            canAgreeDisagree={false}
            canDelete={false}
            title="Compiled Diagnoses"
            subtitle="Please order the diagnoses by priority"
            filter={d => d.how_agree !== 'No'}
          />

          <DiagnosesList
            divider
            title="Diagnoses rejected"
            filter={d => d.how_agree === 'No'}
          />
        </Content>
      </ScrollView>
    </>
  );
}
