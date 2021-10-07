import React from 'react';
import { ScrollView, View } from 'react-native';
import Content from '@/components/Content';
import Text from '@/components/Text';
import ManagementCard from './ManagementCard';
import Header from '../../Header';
import { useDiagnosisContext } from '../Context';

export default function FullDiagnosis() {
  const { props, acceptedDiagnoses, activeDiagnosisIndex, goBack, } = useDiagnosisContext();
  const diagnosis = acceptedDiagnoses[activeDiagnosisIndex];

  if (!diagnosis) return null;

  const data = [
    { text: diagnosis.text1, image: diagnosis.image1 },
    { text: diagnosis.text2, image: diagnosis.image2 },
    { text: diagnosis.text3, image: diagnosis.image3 },
  ];

  const noData = data.reduce((acc, item) => {
    if (item.text || item.image) acc = false;
    return acc;
  }, true);

  return (
    <>
      <Header
        {...props}
        goBack={() => goBack()}
        title={diagnosis.name}
        actionText={`Diagnosis ${activeDiagnosisIndex + 1} of ${acceptedDiagnoses.length}`}
      />
      <ScrollView>
        <Content>
          {!!diagnosis.expressionMeaning && <Text style={{ marginBottom: 20 }}>{diagnosis.expressionMeaning}</Text>}
          {data.map((item, i) => {
            const key = `${i}`;
            return <ManagementCard key={key} {...item} />;
          })}
          {!noData ? null : (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 50 }}>
              <Text style={{ color: '#999' }}>Diagnosis does not have management details</Text>
            </View>
          )}
        </Content>
      </ScrollView>
    </>
  );
}
