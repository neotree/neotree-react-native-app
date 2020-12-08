import React from 'react';
import { TouchableOpacity, Modal, View, ScrollView, Alert } from 'react-native';
import { Icon, Left, ListItem, Radio, Right } from 'native-base';
import moment from 'moment';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import DatePicker from '@/components/DatePicker';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import * as api from '@/api';
import OverlayLoader from '@/components/OverlayLoader';
import { useSessionsContext } from '../SessionsContext';

const deleteOpts = [
  { label: 'All sessions', value: 'all' },
  { label: 'Incomplete sessions', value: 'incomplete' },
  { label: 'Date range', value: 'date_range' },
];

const Delete = () => {
  const [open, setOpen] = React.useState(false);
  const [deleteType, setDeleteType] = React.useState(null)
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);
  const {
    dbSessions,
    getSessions,
  } = useSessionsContext();

  const [deletingSessions, setDeletingSessions] = React.useState(false);

  React.useEffect(() => {
    setDeleteType(null);
    setMinDate(null);
    setMaxDate(null);
  }, [open]);

  const deleteSessions = async (ids = []) => new Promise((resolve, reject) => {
    if (ids.length) {
      (async () => {
        setDeletingSessions(true);
        try {
          await api.deleteSessions(ids);
          await getSessions();
          setOpen(false);
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
                onPress: () => { setOpen(false); },
              }
            ]
          );
          reject(e);
        }
        setDeletingSessions(false);
      })();
    }
  });

  const canDelete = !!deleteType && (deleteType === 'date_range' ? !!(minDate || maxDate) : true);

  return (
    <>
      <TouchableOpacity
        disabled={!dbSessions.length}
        style={{ paddingHorizontal: 10 }}
        onPress={() => setOpen(true)}
      >
        <Icon style={[dbSessions.length ? colorStyles.primaryColor : { color: '#ccc' }]} name="trash" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.8)' }}
        >
          <View>
            <ScrollView>
              <Content>
                <View style={{ backgroundColor: '#fff', padding: 15 }}>
                  <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Delete</Text>

                  <Divider border={false} />

                  {deleteOpts.map(opt => (
                    <ListItem
                      key={opt.value}
                      selected={deleteType === opt.value}
                      onPress={() => setDeleteType(opt.value)}
                    >
                      <Left>
                        <Text>{opt.label}</Text>
                      </Left>
                      <Right>
                        <Radio
                          selected={deleteType === opt.value}
                          onPress={() => setDeleteType(opt.value)}
                        />
                      </Right>
                    </ListItem>
                  ))}

                  {deleteType === 'date_range' && (
                    <View style={{ marginLeft: 15 }}>
                      <Divider border={false} />

                      <DatePicker
                        value={minDate || null}
                        placeholder=""
                        onChange={(e, minDate) => setMinDate(minDate)}
                        maxDate={maxDate ? new Date(maxDate) : null}
                      >
                        Min Date
                      </DatePicker>

                      <Divider border={false} />

                      <DatePicker
                        value={maxDate || null}
                        placeholder=""
                        onChange={(e, maxDate) => setMaxDate(maxDate)}
                        minDate={minDate ? new Date(minDate) : null}
                      >
                        Max Date
                      </DatePicker>

                      <Divider border={false} />
                    </View>
                  )}

                  <Divider border={false} spacing={2} />

                  <View
                    style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}
                  >
                    <TouchableOpacity
                      onPress={() => setOpen(false)}
                    >
                      <Text style={{ fontWeight: 'bold' }}>CANCEL</Text>
                    </TouchableOpacity>

                    <View style={{ width: 15 }} />

                    <TouchableOpacity
                      disabled={!canDelete}
                      onPress={() => {
                        const getParsedDate = d => {
                          d = moment(d).format('YYYY-MM-DD');
                          return new Date(d).getTime();
                        };
                        switch (deleteType) {
                          case 'all':
                            deleteSessions(dbSessions.map(s => s.id));
                            break;
                          case 'incomplete':
                            deleteSessions(dbSessions.filter(s => !s.data.completed_at)
                              .map(s => s.id));
                            break;
                          case 'date_range':
                            if (minDate || maxDate) {
                              deleteSessions(dbSessions
                                .filter(s => !minDate ? true : getParsedDate(s.data.started_at) >= getParsedDate(minDate))
                                .filter(s => !maxDate ? true : getParsedDate(s.data.started_at) <= getParsedDate(maxDate))
                                .map(s => s.id));
                            }
                            break;
                          default:
                            // do nothing
                        }
                      }}
                    >
                      <Text style={[!canDelete ? { color: '#ccc' } : colorStyles.primaryColor, { fontWeight: 'bold' }]}>DELETE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Content>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <OverlayLoader display={deletingSessions} />
    </>
  );
};

export default Delete;
