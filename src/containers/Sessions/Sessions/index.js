import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Link, useHistory } from 'react-router-native';
import { Body, Card, CardItem, Icon } from 'native-base';
import useBackButton from '@/utils/useBackButton';
import Header from '@/components/Header';
import moment from 'moment';
import Content from '@/components/Content';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import colorStyles from '@/styles/colorStyles';
import DeleteBtn from './_DeleteBtn';
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

            <DeleteBtn />
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
                >
                  <Card>
                    <CardItem>
                      <Body>
                        <View style={[{ flexDirection: 'row' }]}>
                          <View style={[{ flex: 1 }]}>
                            <Text style={{ color: '#999' }}>Creation date</Text>
                            <Text>
                              {moment(new Date(item.data.started_at)).format('DD MMM, YYYY HH:MM')}
                            </Text>
                          </View>

                          <View style={[{ flex: 1 }]}>
                            <Text style={{ color: '#999' }}>Completion date</Text>
                            <Text>
                              {item.data.completed_at ?
                                moment(new Date(item.data.completed_at)).format('DD MMM, YYYY HH:MM')
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
    </>
  );
};

export default Sessions;