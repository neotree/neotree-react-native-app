import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { View, Modal, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Spinner, Icon, CardItem, Body, Radio, Card } from 'native-base';
import Content from '@/components/Content';
import Text from '@/components/Text';
import NeotreeIdInput from '@/components/NeotreeIdInput';
import * as api from '@/api';
import theme from '~/native-base-theme/variables/commonColor';

export default function InitialiseDischargeForm({ onClose: _onClose }) {
  const [openModal, setOpenModal] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [uid, setUID] = React.useState('');
  const [data, setData] = React.useState(null);
  const [sessions, setSessions] = React.useState([]);

  const onClose = () => {
    const close = () => {
      setOpenModal(false);
      const matched = data && data.session ? sessions : [];
      _onClose({ uid, session: null, values: null, sessions: matched, ...data }, sessions);
    };
    if (!data || (data && !data.session)) {
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
  };

  const selectSession = React.useCallback(session => {
    const autoFill = Object.keys(session.data.entries).reduce((acc, key) => {
      const { values } = session.data.entries[key];
      return { ...acc, [key]: values.value };
    }, {});
    setData({ uid, session, values: autoFill, });
  }, [uid]);

  const search = React.useCallback(() => {
    (async () => {
      let sessions = [];
      setData(null);
      setSessions([]);
      if (uid) {
        setLoading(true);
        try {
          sessions = await api.getExportedSessionsByUID(uid);
        } catch (e) { /**/ console.log(e); }
      }
      setData({ uid, session: null, values: null, });
      setSessions((sessions || []).filter(s => ['admission', 'neolab'].includes(s.type)));
      setLoading(false);
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
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        >
          <View>
            <ScrollView>
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
                      {sessions.length ? (
                        <>
                          <Text style={{ color: '#16a085', textAlign: 'center' }}>{data.uid} - {sessions.length} sessions found</Text>
                          <View style={{ marginTop: 10 }} />
                          {sessions.map(s => {
                            const selected = s.id === (data.session && data.session.id);
                            return (
                              <TouchableOpacity
                                key={s.id}
                                onPress={() => selectSession(s)}
                              >
                                <Card>
                                  <CardItem
                                    style={[
                                      !selected ? null : { backgroundColor: theme.brandPrimary },
                                    ]}
                                  >
                                    <Body>
                                      <Text
                                        style={[!selected ? null : { color: '#fff' }]}
                                      >{s.data.script.title}</Text>
                                      <Text
                                        style={[!selected ? { color: '#999' } : { color: '#ddd' }]}
                                        variant="caption"
                                      >{moment(s.ingested_at).format('llll')}</Text>
                                    </Body>
                                  </CardItem>
                                </Card>
                              </TouchableOpacity>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <Text style={{ color: '#b20008', textAlign: 'center' }}>{data ? `${data.uid} - ` : null}No match found</Text>
                        </>
                      )}
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

InitialiseDischargeForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string
};
