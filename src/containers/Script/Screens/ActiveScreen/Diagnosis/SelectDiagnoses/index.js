import React from 'react';
import { ScrollView, TouchableWithoutFeedback, View, Modal, TouchableOpacity } from 'react-native';
import { Card, CardItem, Body, Button, Input, Item } from 'native-base';
import Text from '@/components/Text';
import Content from '@/components/Content';
import colorStyles from '@/styles/colorStyles';
import theme from '~/native-base-theme/variables/commonColor';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import { useContext as useScriptContext } from '../../../../Context';
import setPageOptions from '../../../../setPageOptions';

export default function SelectDiagnoses() {
  const { state: { diagnoses: allDiagnoses } } = useScriptContext();
  const {
    props,
    hcwDiagnoses,
    setHcwDiagnoses,
    getDefaultDiagnosis,
    goBack,
    diagnoses,
    setDiagnoses,
  } = useDiagnosisContext();
  const { screen } = props;

  const [searchVal, setSearchVal] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const [customValueModal, setCustomValueModal] = React.useState(null);
  const closeCustomValueModal = () => {
    if (customValue && customValueModal.onClose) customValueModal.onClose({ customValue });
    setCustomValueModal(null);
    setCustomValue('');
  };

  setPageOptions({
    onSearch: value => setSearchVal(value),
  }, [mounted]);

  React.useEffect(() => { setTimeout(() => setMounted(true), 0); }, []);

  const items = (({ ...screen.data.metadata }).items || []).map(item => {
    const d = allDiagnoses.map(d => ({ ...d.data, ...d })).filter(d => d.name === item.label)[0];
    return {
      ...item,
      ...(!d ? null : {
        text1: d.text1,
        image1: d.image1,
        text2: d.text2,
        image2: d.image2,
        text3: d.text3,
        image3: d.image3,
        symptoms: d.symptoms || [],
      }),
    };
  });
  const exclusiveIsSelected = items
    .filter(item => item.exclusive)
    .filter(item => hcwDiagnoses.map(d => d.name).includes(item.label))[0];

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
        // instructions={`${screen.data.instructions || ''}`}
      />

      <ScrollView>
        <Content>
          {!!screen.data.instructions && (
            <View style={{ marginBottom: 25 }}>
              <Text style={[colorStyles.primaryColor]}>Instructions</Text>
              <Text variant="caption">{screen.data.instructions}</Text>
            </View>
          )}

          {items.map((item, i) => {
            const hide = searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false;
            // if (hide) return null;
            
            const key = `${i}`;
            const isExclusive = item.exclusive;
            const diagnosis = hcwDiagnoses.filter(d => d.name === item.label)[0];
            const isSelected = !!diagnosis;
            const disabled = exclusiveIsSelected && !isExclusive;

            const setValue = val => setHcwDiagnoses([...hcwDiagnoses.filter(d => !isExclusive ? true : !items.map(item => item.label).includes(d.name)), {
              ...getDefaultDiagnosis({
                name: item.label,
                how_agree: 'Yes',
                priority: hcwDiagnoses.length,
                text1: item.text1,
                image1: item.image1,
                text2: item.text2,
                image2: item.image2,
                text3: item.text3,
                image3: item.image3,
                suggested: true,
                isHcwDiagnosis: true,
                ...val,
              }),
            }]);

            return (
              <React.Fragment key={key}>
                <TouchableWithoutFeedback
                  style={hide ? { display: 'none' } : {}}
                  onPress={() => {
                    if (exclusiveIsSelected && !isExclusive) return;
                    if (isSelected) {
                      setHcwDiagnoses(hcwDiagnoses.filter(d => d.name !== item.label));
                      setDiagnoses(diagnoses.filter((d) => d.name !== item.label));
                    } else {
                      if (item.enterValueManually) {
                        setCustomValueModal({ onClose: setValue });
                      } else {
                        setValue();
                      }
                    }
                  }}
                >
                  <Card transparent={disabled} style={hide ? { display: 'none' } : {}}>
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
                        {!!(diagnosis && diagnosis.customValue) && (
                          <Text
                            variant="caption"
                            style={[
                              !isSelected ? null : { color: '#fff' },
                              !disabled ? null : { color: '#999' },
                            ]}
                          >{diagnosis.customValue}</Text>
                        )}
                      </Body>
                    </CardItem>
                  </Card>
                </TouchableWithoutFeedback>
                {diagnosis && diagnosis.customValue && (
                  <TouchableOpacity 
                    onPress={() => {
                      setCustomValue(diagnosis.customValue);
                      setCustomValueModal({ onClose: setValue });
                    }}
                  >
                    <Text variant="caption">Edit value</Text>
                  </TouchableOpacity>
                )}
              </React.Fragment>
            );
          })}
          <Modal
            visible={!!customValueModal}
            transparent
            overFullScreen
            onRequestClose={() => closeCustomValueModal()}
            statusBarTranslucent
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,.6)',
              }}
            >
              <View>
                <Content style={{ backgroundColor: '#fff', padding: 10, paddingVertical: 20 }}>
                  <Item regular>
                    <Input
                      value={customValue}
                      onChangeText={val => setCustomValue(val)}
                      placeholder="Custom value"
                    />
                  </Item>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                    <Button transparent onPress={() => closeCustomValueModal()}>
                      <Text>Cancel</Text>
                    </Button>

                    <View style={{ marginHorizontal: 5 }} />

                    <Button disabled={!customValue} onPress={() => closeCustomValueModal()}>
                      <Text>Save</Text>
                    </Button>
                  </View>
                </Content>
              </View>
            </View>
          </Modal>
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
