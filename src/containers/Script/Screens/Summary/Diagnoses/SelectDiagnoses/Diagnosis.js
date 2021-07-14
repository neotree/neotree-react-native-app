import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Modal, View, Text, ScrollView } from 'react-native';
import { H3, Button, Input, Label, Item, } from 'native-base';
import Header from '@/components/Header';
import Content from '@/components/Content';
import colorStyles from '@/styles/colorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import bgColorStyles from '@/styles/bgColorStyles';
import Image from '@/components/Image';
import Fab from '@/components/Fab';

export default function Diagnosis({
  children,
  setDiagnosis,
  diagnosis,
}) {
  const [openModal, setOpenModal] = React.useState(false);
  const [form, _setForm] = React.useState(diagnosis);
  const setForm = s => _setForm(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

  const instrunctions = [
    { text: diagnosis.text1, image: diagnosis.image1 },
    { text: diagnosis.text2, image: diagnosis.image2 },
    { text: diagnosis.text3, image: diagnosis.image3 }
  ].filter(item => item.text || item.image);

  const onClose = () => {
    setDiagnosis(form);
    setOpenModal(false);
  };

  const symptoms = diagnosis.symptoms || [];

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setForm(diagnosis);
          setOpenModal(true);
        }}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={openModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => onClose()}
      >
        <Header
          title="Suggested diagnoses"
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

        <Content
          style={{
            alignItems: 'center',
            flexDirection: 'row',
          }}
          containerProps={bgColorStyles.primaryBg}
        >
          <View style={{ flex: 1 }}>
            <Text variant="caption" style={[colorStyles.primaryColorContrastText, { textTransform: 'uppercase' }]}>
              {diagnosis.name}
            </Text>
          </View>
        </Content>

        <View style={{ flex: 1 }}>
          <ScrollView>
            <Content>
              {!!symptoms.length && (
                <>
                  <Text style={[{ textTransform: 'uppercase' }]}>Symptoms</Text>
                  {symptoms.map((s, i) => (
                    <>
                      <Text style={{ color: '#999' }}>{i + 1}. {s.name}</Text>
                    </>
                  ))}
                  <View style={{ marginBottom: 10 }} />
                </>
              )}

              <H3 style={{ marginBottom: 10 }}>Do you agree with this diagnosis?</H3>

              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                {[
                  {
                    label: 'Yes',
                  },
                  {
                    label: 'No',
                  },
                  {
                    label: 'Maybe',
                  }
                ].map(({ label, ...btnProps }) => {
                  const selected = form.how_agree === label;
                  return (
                    <View key={`follow_${label}`} style={{ minWidth: 70, marginRight: 10 }}>
                      <Button
                        {...btnProps}
                        block
                        onPress={() => setForm({
                          how_agree: label,
                          hcw_reason_given: label === 'No' ? form.hcw_reason_given : null,
                        })}
                        style={selected ? {} : { backgroundColor: '#fff' }}
                      >
                        <Text style={{ color: selected ? '#fff' : '#999' }}>{label}</Text>
                      </Button>
                    </View>
                  );
                })}
              </View>

              {form.how_agree === 'No' && (
                <Item floatingLabel>
                  <Label>Can you explain why not?</Label>
                  <Input
                    value={form.hcw_reason_given}
                    onChangeText={v => setForm({ hcw_reason_given: v })}
                  />
                </Item>
              )}

              <View style={{ marginBottom: 10 }} />

              {instrunctions.map(({ image, text }, i) => {
                const key = `${i}`;
                return (
                  <View key={key} style={{ marginVertical: 10 }}>
                    {!!text && <H3>{text}</H3>}
                    {!!image && (
                      <Image
                        fullWidth
                        resizeMode="contain"
                        source={{ uri: image.data }}
                      />
                    )}
                  </View>
                );
              })}
            </Content>
          </ScrollView>

          <Content>
            <H3 style={{ marginBottom: 10 }}>Did you folow the above instructions?</H3>
            <View style={{ flexDirection: 'row', marginBottom: 25 }}>
              {[
                {
                  label: 'Yes',
                },
                {
                  label: 'No',
                },
                {
                  label: 'Partially',
                }
              ].map(({ label, ...btnProps }) => {
                const selected = form.hcw_follow_instructions === label;
                return (
                  <View key={`follow_${label}`} style={{ minWidth: 70, marginRight: 10 }}>
                    <Button
                      {...btnProps}
                      block
                      onPress={() => setForm({ hcw_follow_instructions: label })}
                      style={selected ? {} : { backgroundColor: '#fff' }}
                    >
                      <Text style={{ color: selected ? '#fff' : '#999' }}>{label}</Text>
                    </Button>
                  </View>
                );
              })}
            </View>
          </Content>

          <Fab onPress={() => onClose()}>
            <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="arrow-forward" />
          </Fab>
        </View>
      </Modal>
    </>
  );
}

Diagnosis.propTypes = {
  children: PropTypes.node,
  setDiagnosis: PropTypes.func.isRequired,
  diagnosis: PropTypes.object.isRequired,
};
