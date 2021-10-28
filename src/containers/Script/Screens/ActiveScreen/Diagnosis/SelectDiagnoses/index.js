import React from 'react';
import { ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Card, CardItem, Body } from 'native-base';
import Text from '@/components/Text';
import Content from '@/components/Content';
import theme from '~/native-base-theme/variables/commonColor';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from './DiagnosesList';
import AddDiagnosis from './AddDiagnosis';

export default function SelectDiagnoses() {
  const {
    props,
    hcwDiagnoses,
    setHcwDiagnoses,
    getDefaultDiagnosis,
    goBack,
  } = useDiagnosisContext();
  const { screen } = props;

  const items = ({ ...screen.data.metadata }).items || [];
  const exclusiveIsSelected = items
    .filter(item => item.exclusive)
    .filter(item => hcwDiagnoses.map(d => d.name).includes(item.label))[0];

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
      />

      <ScrollView>
        <Content>
          {items.map((item, i) => {
            const key = `${i}`;
            const isExclusive = item.exclusive;
            const isSelected = !!hcwDiagnoses.filter(d => d.name === item.label)[0];
            const disabled = exclusiveIsSelected && !isExclusive;

            return (
              <TouchableWithoutFeedback
                key={key}
                onPress={() => {
                  if (exclusiveIsSelected && !isExclusive) return;
                  setHcwDiagnoses(isSelected ?
                    hcwDiagnoses.filter(d => d.name !== item.label)
                    :
                    [...hcwDiagnoses.filter(d => !isExclusive ? true : !items.map(item => item.label).includes(d.name)), {
                      ...getDefaultDiagnosis({
                        name: item.label,
                        how_agree: 'Yes',
                        priority: hcwDiagnoses.length,
                      }),
                    }]);
                }}
              >
                <Card transparent={disabled}>
                  <CardItem style={[
                    !isSelected ? null : { backgroundColor: theme.brandPrimary },
                    !disabled ? null : { backgroundColor: '#f5f5f5' },
                  ]}
                  >
                    <Body style={{ alignItems: 'center', }}>
                      <Text
                        style={[
                          { fontSize: 20, padding: 5 },
                          !isSelected ? null : { color: '#fff' },
                          !disabled ? null : { color: '#999' },
                        ]}
                      >{item.label}</Text>
                    </Body>
                  </CardItem>
                </Card>
              </TouchableWithoutFeedback>
            );
          })}
        </Content>
        {/* <Content>
          <DiagnosesList
            title="Diagnoses made"
            subtitle="Please order the hcwDiagnoses by priority"
            filter={d => d.how_agree !== 'No'}
          />

          <AddDiagnosis />

          <View style={{ marginVertical: 50 }} />

          <DiagnosesList
            title="Diagnoses rejected"
            filter={d => d.how_agree === 'No'}
          />
        </Content> */}
      </ScrollView>
    </>
  );
}
