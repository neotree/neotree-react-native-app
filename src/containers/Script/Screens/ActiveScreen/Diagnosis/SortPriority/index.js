import React from 'react';
import { ScrollView, View, TouchableOpacity, Text, Picker, } from 'react-native';
import { Radio } from 'native-base';
import Content from '@/components/Content';
import { useDiagnosisContext } from '../Context';
import Header from '../../Header';
import DiagnosesList from '../components/DiagnosesList';

export default function SortPriority() {
  const { props, diagnoses, setDiagnoses, goBack, } = useDiagnosisContext();
  const [pickerValue, setPickerValue] = React.useState("");

  const filterCompiled = d => d.how_agree !== 'No';

  return (
    <>
      <Header 
        {...props} 
        goBack={() => goBack()}
        title={`${props.screen.data.title3 || ''}`}
        instructions={`${props.screen.data.instructions3 || ''}`}
      />

      <ScrollView>
        <Content>
          <DiagnosesList
            divider
            canAgreeDisagree={false}
            canDelete={false}
            title="Compiled Diagnoses"
            subtitle="Please order the diagnoses by priority"
            filter={filterCompiled}
            itemWrapper={((card, { item: d, index: i }) => {
              const onChange = value => setDiagnoses(diagnoses.map((d, index) => index !== i ? d : {
                ...d,
                ...value,
              }));

              const disablePrimary = !!diagnoses.filter(d => d.isPrimaryProvisionalDiagnosis).length;
              const disableSecondary = !!diagnoses.filter(d => d.isSecondaryProvisionalDiagnosis).length;

              const onPrimary = () => onChange({ 
                isPrimaryProvisionalDiagnosis: true,
                isSecondaryProvisionalDiagnosis: false, 
              });
              const onSecondary = () => onChange({ 
                isPrimaryProvisionalDiagnosis: false,
                isSecondaryProvisionalDiagnosis: true, 
              });
              const onOther = () => onChange({ 
                isPrimaryProvisionalDiagnosis: false,
                isSecondaryProvisionalDiagnosis: false, 
              });

              return (
                <View>
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <View style={{ flex: 1 }}>{card}</View>
                    <View style={{ width: 110 }}>
                      <Picker
                        note
                        mode="dropdown"
                        placeholder={{
                          label: 'Move',
                          value: 0
                        }}
                        value={pickerValue}
                        onValueChange={(value) => {
                          if (!isNaN(Number(value))) {
                            const d = [...diagnoses].filter((d, j) => j === i)[0];
                            const items = [...diagnoses].filter((d, j) => j !== i);
                            items.splice(Number(value), 0, d);
                            setDiagnoses(items);
                          }
                          setPickerValue(0);
                        }}
                      >
                        <Picker.Item value="0" label="Move" />
                        {diagnoses.filter(filterCompiled).map((d, j) => {
                          const key = j;
                          if (i === j) return null;
                          return <Picker.Item key={key} label={`Move to position ${j + 1}`} value={`${j}`} />;
                        })}
                      </Picker>
                    </View>
                  </View>
                  {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, }}
                      onPress={() => onPrimary()}
                      disabled={disablePrimary}
                    >
                      <Radio color={disablePrimary ? '#999' : '#000'} disabled={disablePrimary} onPress={() => onPrimary()} selected={d.isPrimaryProvisionalDiagnosis} />
                      <Text style={[{ marginLeft: 5 }, disablePrimary ? { color: '#999' } : { color: '#000' }]}>Primary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, }}
                      onPress={() => onSecondary()}
                      disabled={disableSecondary}
                    >
                      <Radio color={disableSecondary ? '#999' : '#000'} disabled={disableSecondary} onPress={() => onSecondary()} selected={d.isSecondaryProvisionalDiagnosis} />
                      <Text style={[{ marginLeft: 5 }, disableSecondary ? { color: '#999' } : { color: '#000' }]}>Secondary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, }}
                      onPress={() => onOther()}
                    >
                      <Radio color="#000" onPress={() => onOther()} selected={!(d.isPrimaryProvisionalDiagnosis || d.isSecondaryProvisionalDiagnosis)} />
                      <Text style={{ marginLeft: 5 }}>Other</Text>
                    </TouchableOpacity>
                  </View> */}
                </View>
              );
            })}
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
