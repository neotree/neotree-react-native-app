import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View } from 'react-native';
import { Card, CardItem, Body, Radio } from 'native-base';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '~/native-base-theme/variables/commonColor';
import setPageOptions from '../../../../setPageOptions';

const ManageSelectedDiagnoses = props => {
  const { setSection, diagnoses, setDiagnoses } = props;

  setPageOptions({
    title: 'Management',
    hideActionText: true,
  });

  return (
    <>
      <Content>
        <TouchableOpacity
          transparent
          onPress={() => setSection('select')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <MaterialIcons size={18} color={theme.brandPrimary} name="arrow-back" />
            <Text
              variant="caption"
              style={{ color: theme.brandPrimary, marginLeft: 5, }}
            >Suggested diagnoses</Text>
          </View>
        </TouchableOpacity>

        <View style={{ marginBottom: 15, }} />

        {diagnoses.map((d, i) => {
          const key = `${i}`;
          const onChange = value => setDiagnoses(diagnoses => diagnoses.map((d, index) => index !== i ? d : {
            ...d,
            isPrimaryProvisionalDiagnosis: value,
          }));
          const selected = d.isPrimaryProvisionalDiagnosis;

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
    </>
  );
};

ManageSelectedDiagnoses.propTypes = {
  setSection: PropTypes.func.isRequired,
  setDiagnoses: PropTypes.func.isRequired,
  diagnoses: PropTypes.array.isRequired,
};

export default ManageSelectedDiagnoses;
