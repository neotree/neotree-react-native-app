import React from 'react';
import PropTypes from 'prop-types';
import { View, Modal, Alert } from 'react-native';
import { Button, Text, Spinner, Icon } from 'native-base';
import Content from '@/components/Content';
import NeotreeIdInput from '@/components/NeotreeIdInput';
import * as api from '@/api';

export default function InitialiseDischargeForm({ onClose: _onClose }) {
  const [openModal, setOpenModal] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [uid, setUID] = React.useState('');
  const [data, setData] = React.useState(null);

  const onClose = React.useCallback(() => {
    const close = () => {
      setOpenModal(false);
      _onClose({ uid, session: null, values: null, ...data });
    };
    if (!data) {
      Alert.alert(
        'Warning',
        'Are you sure you want to continue without searching possible matches?',
        [
          {
            text: 'No',
            onPress: () => {},
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: () => close(),
            style: 'cancel'
          },
        ]
      );
    } else {
      close();
    }
  }, [uid, data]);

  const search = React.useCallback(() => {
    (async () => {
      let session = null;
      let autoFill = null;
      setData(null);
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
      setData({ uid, session, values: autoFill, });
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <NeotreeIdInput
                    optional
                    label="Admission form UID"
                    value={uid}
                    onChange={uid => setUID(uid)}
                    disabled={loading}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 'auto', width: 60, justifyContent: 'center' }}>
                  <Button
                    transparent
                    block={false}
                    disabled={!uid || loading || (data && (data.uid === uid))}
                    onPress={() => search()}
                  >
                    {loading ? <Spinner size={20} /> : <Icon name="search" />}
                  </Button>
                </View>
              </View>

              {!!data && (
                <View style={{ margin: 10 }}>
                  {(data && data.session) ?
                    <Text style={{ color: '#16a085', textAlign: 'center' }}>{data.uid} - Match found</Text>
                    :
                    <Text style={{ color: '#b20008', textAlign: 'center' }}>{data ? `${data.uid} - ` : null}No match found</Text>}
                </View>
              )}

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
                  iconRight
                  onPress={() => onClose()}
                >
                  <Text>Continue</Text>
                  <Icon name="arrow-forward" />
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
