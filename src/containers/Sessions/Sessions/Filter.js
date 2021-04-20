import React from 'react';
import { TouchableOpacity, Modal, View, ScrollView } from 'react-native';
import { Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import DatePicker from '@/components/DatePicker';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import Header from '@/components/Header';
import { useSessionsContext } from '../SessionsContext';

const Filter = () => {
  const [open, setOpen] = React.useState(false);
  const {
    clearFilters,
    filters: sessionsFilters,
    filterSessions,
  } = useSessionsContext();
  const [filters, _setFilters] = React.useState(sessionsFilters);
  const setFilters = f => _setFilters(filters => ({ ...filters, ...f }));

  return (
    <>
      <TouchableOpacity
        style={{ paddingVertical: 3, paddingHorizontal: 5 }}
        onPress={() => setOpen(true)}
      >
        <Text style={[colorStyles.primaryColor]}>Filter</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: '#fff' }}
        >
          <Header
            title="Filter sessions"
            leftActions={(
              <>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => setOpen(false)}
                >
                  <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="arrow-back" />
                </TouchableOpacity>
              </>
            )}
            rightActions={(
              <>
                <TouchableOpacity
                  disabled={!Object.keys(filters).length}
                  style={{ paddingVertical: 3, paddingHorizontal: 10 }}
                  onPress={() => {
                    clearFilters();
                    _setFilters({});
                    filterSessions({});
                  }}
                >
                  <Text style={[Object.keys(filters).length ? colorStyles.primaryColor : { color: '#ccc' }]}>Clear</Text>
                </TouchableOpacity>
              </>
            )}
          />

          <ScrollView>
            <Content>
              <DatePicker
                value={filters.minDate || null}
                placeholder=""
                onChange={(e, minDate) => setFilters({ minDate })}
                maxDate={filters.maxDate ? new Date(filters.maxDate) : null}
              >
                Min Date
              </DatePicker>

              <Divider border={false} />

              <DatePicker
                value={filters.maxDate || null}
                placeholder=""
                onChange={(e, maxDate) => setFilters({ maxDate })}
                minDate={filters.minDate ? new Date(filters.minDate) : null}
              >
                Max Date
              </DatePicker>

              <Divider border={false} />

              <Button
                disabled={!Object.keys(filters).length}
                onPress={() => {
                  setOpen(false);
                  filterSessions(filters);
                }}
              >
                <Text style={{ flex: 1, textAlign: 'center' }}>Filter</Text>
              </Button>
            </Content>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default Filter;
