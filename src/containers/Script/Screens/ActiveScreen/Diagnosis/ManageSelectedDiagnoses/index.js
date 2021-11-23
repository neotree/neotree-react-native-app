import React from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import { Card, CardItem, Body, Radio } from 'native-base';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import Header from '../../Header';
import { useDiagnosisContext } from '../Context';

const ManageSelectedDiagnoses = () => {
  const { props, diagnoses, setDiagnoses, goBack } = useDiagnosisContext();

  return (
    <>
      <Header
        {...props}
        goBack={() => goBack()}
        hideActionText
        title={`${props.screen.data.title4 || ''}`}
      />

      <ScrollView>
        <Content>
          {diagnoses.map((d, i) => {
            const key = `${i}`;
            const onChange = value => setDiagnoses(diagnoses.map((d, index) => index !== i ? d : {
              ...d,
              isPrimaryProvisionalDiagnosis: value,
            }));
            const selected = d.isPrimaryProvisionalDiagnosis;

            if (d.how_agree === 'No') return null;

            return (
              <React.Fragment key={key}>
                <Card>
                  <CardItem>
                    <Body>
                      <Text>{d.name}</Text>
                      <View>
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', padding: 10, }}
                          onPress={() => onChange(true)}
                        >
                          <Radio selected={selected} />
                          <Text variant="caption" style={{ marginLeft: 5, color: '#999' }}>Primary Provisional Diagnosis</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', padding: 10, }}
                          onPress={() => onChange(false)}
                        >
                          <Radio selected={!selected} />
                          <Text variant="caption" style={{ marginLeft: 5, color: '#999' }}>Other Problem</Text>
                        </TouchableOpacity>
                      </View>
                    </Body>
                  </CardItem>
                </Card>

                <Divider border={false} />
              </React.Fragment>
            );
          })}
        </Content>
      </ScrollView>
    </>
  );
};

export default ManageSelectedDiagnoses;
