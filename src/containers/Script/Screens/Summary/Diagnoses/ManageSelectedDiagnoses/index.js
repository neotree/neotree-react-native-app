import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View } from 'react-native';
import { Icon, Card, CardItem, Body, Radio } from 'native-base';
import Header from '@/components/Header';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import useBackButton from '@/utils/useBackButton';
import FloatingButton from '../FinalActionButton';

const ManageSelectedDiagnoses = props => {
  const { setSection, diagnoses, setDiagnoses } = props;

  const goBack = () => setSection('select');
  useBackButton(() => { goBack(); });

  return (
    <>
      <Header
        title="Management"
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
      />

      <Content>
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

      <FloatingButton {...props} />
    </>
  );
};

ManageSelectedDiagnoses.propTypes = {
  setSection: PropTypes.func.isRequired,
  setDiagnoses: PropTypes.func.isRequired,
  diagnoses: PropTypes.array.isRequired,
};

export default ManageSelectedDiagnoses;
