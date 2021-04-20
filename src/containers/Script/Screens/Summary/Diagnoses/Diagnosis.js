import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Modal, } from 'react-native';
import DiagnosisDetails from '@/components/Diagnosis';
import Header from '@/components/Header';
import Content from '@/components/Content';
import { Icon } from 'native-base';
import colorStyles from '@/styles/colorStyles';

export default function Diagnosis({
  children,
  setDiagnosis,
  diagnosis,
}) {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setOpenModal(true)}>
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
                  <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
                </TouchableOpacity>
              </>
            )}
          />

          <Content>
            <DiagnosisDetails diagnosis={diagnosis} />
          </Content>
      </Modal>
    </>
  );
}

Diagnosis.propTypes = {
  children: PropTypes.node,
  setDiagnosis: PropTypes.func.isRequired,
  diagnosis: PropTypes.bool.isRequired,
};
