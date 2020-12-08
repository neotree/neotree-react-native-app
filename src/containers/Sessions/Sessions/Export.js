import React from 'react';
import { TouchableOpacity, Modal, View, ScrollView, Alert } from 'react-native';
import { Icon, Left, ListItem, Radio, Right } from 'native-base';
import { useHistory } from 'react-router-native';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import DatePicker from '@/components/DatePicker';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import { useSessionsContext } from '../SessionsContext';

const exportOpts = [
  { label: 'All sessions', value: 'all' },
  { label: 'Completed sessions', value: 'completed' },
  { label: 'Incomplete sessions', value: 'incomplete' },
  { label: 'Date range', value: 'date_range' },
];

const Export = () => {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const { dbSessions } = useSessionsContext();
  const [exportType, setExportType] = React.useState('all')
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);

  React.useEffect(() => {
    setExportType('all');
    setMinDate(null);
    setMaxDate(null);
  }, [open]);

  const canExport = !!exportType && (exportType === 'date_range' ? !!(minDate || maxDate) : true);

  return (
    <>
      <TouchableOpacity
        disabled={!dbSessions.length}
        style={{ paddingHorizontal: 10 }}
        onPress={() => setOpen(true)}
      >
        <Icon style={[dbSessions.length ? colorStyles.primaryColor : { color: '#ccc' }]} name="save" />
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
                  <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Export</Text>

                  <Divider border={false} />

                  {exportOpts.map(opt => (
                    <ListItem
                      key={opt.value}
                      selected={exportType === opt.value}
                      onPress={() => setExportType(opt.value)}
                    >
                      <Left>
                        <Text>{opt.label}</Text>
                      </Left>
                      <Right>
                        <Radio
                          selected={exportType === opt.value}
                          onPress={() => setExportType(opt.value)}
                        />
                      </Right>
                    </ListItem>
                  ))}

                  {exportType === 'date_range' && (
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
                      disabled={!canExport}
                      onPress={() => history
                        .push(`/sessions/export?exportType=${exportType}&minDate=${minDate || ''}&maxDate=${maxDate || ''}`)}
                    >
                      <Text style={[!canExport ? { color: '#ccc' } : colorStyles.primaryColor, { fontWeight: 'bold' }]}>EXPORT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Content>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Export;
