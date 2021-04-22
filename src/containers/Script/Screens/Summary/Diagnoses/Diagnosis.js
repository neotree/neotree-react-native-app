import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Modal, View, Text, ScrollView } from 'react-native';
import { H3, Button } from 'native-base';
import Header from '@/components/Header';
import Content from '@/components/Content';
import colorStyles from '@/styles/colorStyles';
import { MaterialIcons } from '@expo/vector-icons';
import bgColorStyles from '@/styles/bgColorStyles';
import Image from '@/components/Image';

export default function Diagnosis({
  children,
  setDiagnosis,
  diagnosis,
}) {
  const [openModal, setOpenModal] = React.useState(false);
  
  // const instrunctions = [
  //   { text: diagnosis.text1, image: diagnosis.image1 },
  //   { text: diagnosis.text2, image: diagnosis.image2 },
  //   { text: diagnosis.text3, image: diagnosis.image3 }
  // ].filter(item => item.text || item.image);

  const instrunctions = [
    { text: diagnosis.text1, image: { data: 'https://webeditor-dev.neotree.org/file/e0bc71a2-edf0-4759-a58c-b8753e15b6c8' } },
    { text: diagnosis.text2, image: { data: 'https://webeditor-dev.neotree.org/file/e0bc71a2-edf0-4759-a58c-b8753e15b6c8' } },
    { text: diagnosis.text3, image: { data: 'https://webeditor-dev.neotree.org/file/e0bc71a2-edf0-4759-a58c-b8753e15b6c8' } }
  ].filter(item => item.text || item.image);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpenModal(true)}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={openModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setOpenModal(false)}
      >
        <Header
          title="Suggested diagnoses"
          leftActions={(
            <>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => setOpenModal(false)}
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
              <H3>Do you agree with this diagnosis?</H3>
              <View style={{ flexDirection: 'row', marginBottom: 25 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Button block>
                    <Text style={{ color: '#fff' }}>Yes</Text>
                  </Button>
                </View>

                <View style={{ flex: 1, marginRight: 10 }}>
                  <Button block>
                    <Text style={{ color: '#fff' }}>No</Text>
                  </Button>
                </View>

                <View style={{ flex: 1, marginRight: 10 }}>
                  <Button block>
                    <Text style={{ color: '#fff' }}>Maybe</Text>
                  </Button>
                </View>
              </View>
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
        </View>
      </Modal>
    </>
  );
}

Diagnosis.propTypes = {
  children: PropTypes.node,
  setDiagnosis: PropTypes.func.isRequired,
  diagnosis: PropTypes.bool.isRequired,
};
