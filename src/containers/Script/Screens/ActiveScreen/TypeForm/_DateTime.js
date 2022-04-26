import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import { View } from 'react-native';
import Text from '@/components/Text';
import DateInput from '@/components/DateInput';
import diffHours from '@/utils/diffHours';

const styles = {
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
    // padding: 5,
  },
};

const _DateTime = ({ field, onChange: _onChange, value, conditionMet, entries, form }) => {
  const onChange = (d, opts) => {
    _onChange(d, {
      ...opts,
      valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY HH:mm') : '',
      calculateValue: d ? diffHours(new Date(d), new Date()) : null,
    });
  };
  const [date, setDate] = React.useState(field.defaultValue ? value || new Date() : value);

  const onDateChange = (date) => {
    if (date) {
      date = new Date(date);
      setDate(date);
      onChange(date.toISOString());
    }
  };

  React.useEffect(() => {
    const v = value ? new Date(value).toISOString() : null;
    const d = date ? new Date(date).toISOString() : null;
    if (v !== d) onChange(date);
  });

  const getMinOrMaxDate = key => {
    return [...entries.reduce((acc, e) => [...acc, ...e.values], []), ...form.values]
      .filter(e => e.key === (field[`${key}DateKey`] || '').replace('$', ''))
      .map(e => e.value && e.value.map ? null : e.value)[0];
  };

  const maxDate = getMinOrMaxDate('max');
  const minDate = getMinOrMaxDate('min');

  return (
    <>
      {!field.label ? null : (
        <Text
          {...conditionMet ? null : { style: { color: '#ccc' } }}
        >
          {field.label}{field.optional ? '' : ' *'}
        </Text>
      )}

      <DateInput
        mode="datetime"
        value={date}
        disabled={!conditionMet}
        // label={`${field.label}${field.optional ? '' : ' *'}`}
        onChange={date => date && onDateChange(date)}
        maxDate={maxDate || field.maxDate}
        minDate={minDate || field.minDate}
      />

      {/* <View style={[styles.gridContainer]}>
        <View style={[styles.gridItem]}>
          <DatePicker
            enabled={conditionMet}
            value={date || null}
            placeholder={formCopy.SELECT_DATE}
            onChange={onDateChange}
            maxDate={maxDate || field.maxDate}
            minDate={minDate || field.minDate}
          />
        </View>

        <View style={{ width: 10 }} />

        <View style={[styles.gridItem]}>
          <DatePicker
            enabled={date ? conditionMet : false}
            mode="time"
            value={date || null}
            placeholder={formCopy.SELECT_TIME}
            onChange={onDateChange}
          />
        </View>
      </View> */}
    </>
  );
};

_DateTime.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default _DateTime;
