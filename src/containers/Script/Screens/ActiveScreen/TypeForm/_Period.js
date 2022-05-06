import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity } from 'react-native';
import Text from '@/components/Text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import diffHours from '@/utils/diffHours';

const _Period = ({ form, field, onChange: _onChange, conditionMet, valueObject, }) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [dateTimePickerMode, setDateTimePickerMode] = React.useState('date');
  const [date, setDate] = React.useState(null);
  const [dateNoTime, setDateNoTime] = React.useState(null);
  const [calcFrom, setCalcFrom] = React.useState(null);

  const onChange = React.useCallback((d) => {
    let value = d ? diffHours(new Date(d), new Date()) : null;
    value = d ? (value < 1 ? 1 : value) : null;
    let days = 0;
    let hrs = 0;
    let valueText = [];
    if (value) {
      days = Math.floor(value / 24);
      hrs = Math.floor(value % 24);
      if (days) valueText.push(`${days} day(s)`);
      if (hrs) valueText.push(`${hrs} hour(s)`);
    }
    _onChange(value, {
      error: null,
      // value,
      valueText: d ? valueText.map(t => t).join(', ') : null,
      exportValue: value,
      calculateValue: value,
    });
  }, []);

  React.useEffect(() => {
    const _calcFrom = form.values.filter(v => `$${v.key}` === field.calculation)[0];
    if (JSON.stringify(_calcFrom) !== JSON.stringify(calcFrom)) {
      setCalcFrom(_calcFrom);
      if (_calcFrom) onChange(_calcFrom.value);
    }
  }, [form, calcFrom]);

  React.useEffect(() => { onChange(date); }, [date]);

  return (
    <>
      <Text
        style={conditionMet ? {} : { color: '#999' }}
      >{field.label}{field.optional ? '' : ' *'}</Text>

      <View
        style={{
          padding: 10,
          borderColor: '#ccc',
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text
          variant="caption"
          style={({ flex: 1, ...(conditionMet ? {} : { color: '#999' }) })}
        >{valueObject ? valueObject.valueText : ''}</Text>

        {!calcFrom && (
          <TouchableOpacity
            disabled={!conditionMet}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons
              size={24}
              color="black"
              style={conditionMet ? {} : { color: '#999' }}
              name="event"
            />
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <View style={{ flex: 1 }}>
          <DateTimePicker
            mode={dateTimePickerMode}
            testID="periodDateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={date || new Date()}
            is24Hour
            display="default"
            maximumDate={new Date()}
            onChange={(e, newDate) => {
              setShowDatePicker(false);
              if (dateTimePickerMode === 'time') {
                if (dateNoTime && newDate) {
                  const newestDate = new Date(dateNoTime);
                  newestDate.setHours(newDate.getHours());
                  newestDate.setMinutes(newDate.getMinutes());
                  newDate = newestDate;
                }
                setDateTimePickerMode('date');
                setDate(newDate);
                setShowDatePicker(false);
              } else {
                setDateNoTime(newDate);
                setDateTimePickerMode('time');
                setDate(newDate);
                setShowDatePicker(true);
              }
            }}
          />
        </View>
      )}
    </>
  );
};

_Period.propTypes = {
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  conditionMet: PropTypes.bool,
  // value: PropTypes.any,
  valueObject: PropTypes.object,
};

export default _Period;
