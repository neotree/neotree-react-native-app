import React from 'react';
import PropTypes from 'prop-types';
import { View, Modal } from 'react-native';
import { Button, Text, Spinner, Icon } from 'native-base';
import Content from '@/components/Content';
import NeotreeIdInput from '@/components/NeotreeIdInput';
import * as api from '@/api';

export default function InitialiseDischargeForm({ onClose: _onClose }) {
  const [openModal, setOpenModal] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [uid, setUID] = React.useState('');

  const onClose = React.useCallback(() => {
    (async () => {
      let session = null;
      let autoFill = null;
      if (uid) {
        setLoading(true);
        try {
          session = await api.getExportedSessionByUID(uid);
          if (session) {
            autoFill = Object.keys(session.data.entries).reduce((acc, key) => {
              const { values } = session.data.entries[key];
              return { ...acc, [key]: values.value };
            }, {});
          }
        } catch (e) { /**/ console.log(e); }
      }
      setLoading(false);
      setOpenModal(false);
      _onClose({ uid, session, values: autoFill, });
    })();
  }, [uid]);

  return (
    <>
      <Modal
        visible={openModal}
        transparent
        overFullScreen
        onRequestClose={() => onClose()}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            // alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        >
          <Content>
            <View style={{ backgroundColor: '#fff', padding: 10, }}>
              <NeotreeIdInput
                optional
                label="Admission form UID"
                value={uid}
                onChange={uid => setUID(uid)}
                disabled={loading}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginTop: 10,
                }}
              >

                <Button
                  transparent
                  block={false}
                  disabled={loading}
                  iconRight={loading}
                  onPress={() => onClose()}
                >
                  <Text>Continue</Text>
                  {loading ? <Spinner size={20} /> : <Icon name="arrow-forward" />}
                </Button>
              </View>
            </View>
          </Content>
        </View>
      </Modal>
    </>
  );
}

InitialiseDischargeForm.propTypes = {
  onClose: PropTypes.func.isRequired
};
