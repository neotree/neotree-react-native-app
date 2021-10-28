import React from 'react';
import { TouchableOpacity, Modal, View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Button, Card, CardItem, Body } from 'native-base';
import Header from '@/components/Header';
import Text from '@/components/Text';
import Content from '@/components/Content';
import colorStyles from '@/styles/colorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import Fab from '@/components/Fab';
import theme from '~/native-base-theme/variables/commonColor';
import { useDiagnosisContext } from '../Context';

export default function AddDiagnosis() {
  const {
    props: { screen },
    setDiagnoses,
    diagnoses,
    getDefaultDiagnosis,
  } = useDiagnosisContext();

  const [openModal, setOpenModal] = React.useState(false);

  const onClose = () => {
    setOpenModal(false);
  };

  const items = ({ ...screen.data.metadata }).items || [];
  const exclusiveIsSelected = items
    .filter(item => item.exclusive)
    .filter(item => diagnoses.map(d => d.name).includes(item.label))[0];

  if (!items.length) return null;

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Button
          block={false}
          onPress={() => {
            setOpenModal(true);
          }}
        >
          <Text>Add diagnosis</Text>
        </Button>
      </View>

      <Modal
        visible={openModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => onClose()}
      >
        <Header
          title="Select diagnoses"
          leftActions={(
            <>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => onClose()}
              >
                <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="arrow-back" />
              </TouchableOpacity>
            </>
            )}
        />

        <View style={{ flex: 1 }}>
          <ScrollView>
            <Content>
              {items.map((item, i) => {
                const key = `${i}`;
                const isExclusive = item.exclusive;
                const isSelected = !!diagnoses.filter(d => d.name === item.label)[0];
                const disabled = exclusiveIsSelected && !isExclusive;

                return (
                  <TouchableWithoutFeedback
                    key={key}
                    onPress={() => {
                      if (exclusiveIsSelected && !isExclusive) return;
                      setDiagnoses(isSelected ?
                        diagnoses.filter(d => d.name !== item.label)
                        :
                        [...diagnoses.filter(d => !isExclusive ? true : !items.map(item => item.label).includes(d.name)), {
                          ...getDefaultDiagnosis({
                            name: item.label,
                            how_agree: 'Yes',
                            priority: diagnoses.length,
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
          </ScrollView>

          <Fab onPress={() => onClose()}>
            <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="arrow-forward" />
          </Fab>
        </View>
      </Modal>
    </>
  );
}
