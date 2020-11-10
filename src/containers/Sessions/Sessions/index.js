import React from 'react';
import { View, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Link, useHistory } from 'react-router-native';
import { ActionSheet, Body, Card, CardItem, Icon } from 'native-base';
import useBackButton from '@/utils/useBackButton';
import Header from '@/components/Header';
import moment from 'moment';
import Content from '@/components/Content';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import colorStyles from '@/styles/colorStyles';
import OverlayLoader from '@/components/OverlayLoader';
import * as api from '@/api';
import { useSessionsContext } from '../SessionsContext';

const Sessions = () => {
  const {
    sessions,
    getSessions,
    loadingSessions,
  } = useSessionsContext();

  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  useBackButton(() => { goBack(); }, []);

  const [deletingSessions, setDeletingSessions] = React.useState(false);

  const deleteSessions = async (ids = []) => new Promise((resolve, reject) => {
    if (ids.length) {
      (async () => {
        setDeletingSessions(true);
        try {
          await api.deleteSessions(ids);
          await getSessions();
          resolve();
        } catch (e) {
          Alert.alert(
            'ERROR',
            e.message || e.msg || JSON.stringify(e),
            [
              {
                text: 'Try again',
                type: 'cancel',
                onPress: () => deleteSessions(ids),
              },
              {
                text: 'Cancel',
                type: 'cancel',
                onPress: () => {},
              }
            ]
          );
          reject(e);
        }
        setDeletingSessions(false);
      })();
    }
  });

  return (
    <>
      <Header
        title="Session history"
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
        rightActions={(
          <>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => history.push('/sessions/export')}
            >
              <Icon style={[colorStyles.primaryColor]} name="save" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => {
                ActionSheet.show(
                  {
                    options: [
                      'Incomplete sessions',
                      'ALL sessions',
                      Platform.OS === 'ios' ? 'Cancel' : null
                    ].filter(o => o),
                    title: 'Permanantly delete',
                    cancelButtonIndex: 2,
                  },
                  i => {
                    const incompleted = sessions.filter(s => !s.data.completed_at)
                      .map(s => s.id);
                    const all = sessions.map(s => s.id);
                    if (i < 2) deleteSessions(i === 0 ? incompleted : all);
                  }
                );
              }}
            >
              <Icon style={[colorStyles.primaryColor]} name="trash" />
            </TouchableOpacity>
          </>
        )}
      />

      <View style={[{ flex: 1 }]}>
        <FlatList
          data={sessions}
          onRefresh={getSessions}
          refreshing={loadingSessions}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <Content>
                <Link
                  to={`/sessions/session/${item.id}`}
                  style={[{ flex: 1 }]}
                  component={TouchableOpacity}
                  onLongPress={() => {
                    Alert.alert(
                      'Delete session',
                      'Do you want to delete this session?',
                      [
                        {
                          text: 'No',
                          type: 'cancel',
                          onPress: () => {},
                        },
                        {
                          text: 'Yes',
                          type: 'cancel',
                          onPress: () => deleteSessions([item.id]),
                        }
                      ]
                    );
                  }}
                >
                  <Card>
                    <CardItem>
                      <Body>
                        <View style={[{ flexDirection: 'row' }]}>
                          <View style={[{ flex: 1 }]}>
                            <Text style={{ color: '#999' }}>Creation date</Text>
                            <Text>
                              {moment(new Date(item.data.started_at)).format('DD MMM, YYYY HH:mm')}
                            </Text>
                          </View>

                          <View style={[{ flex: 1 }]}>
                            <Text style={{ color: '#999' }}>Completion date</Text>
                            <Text>
                              {item.data.completed_at ?
                                moment(new Date(item.data.completed_at)).format('DD MMM, YYYY HH:mm')
                                :
                                'N/A'}
                            </Text>
                          </View>
                        </View>

                        <Divider border={false} />

                        <Text style={{ color: '#999' }}>Script</Text>
                        <Text>{item.data.script.data.title}</Text>
                      </Body>
                    </CardItem>
                  </Card>
                </Link>
              </Content>
            </View>
          )}
          keyExtractor={item => `${item.id}`}
        />
      </View>

      <OverlayLoader display={deletingSessions} />
    </>
  );
};

export default Sessions;
