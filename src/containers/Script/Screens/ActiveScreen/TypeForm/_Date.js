import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import { View } from 'react-native';
import Text from '@/components/Text';
import DateInput from '@/components/DateInput';

const FieldDate = ({ field, onChange: _onChange, value, conditionMet, entries, form }) => {
  const onChange = (d, opts) => _onChange(d, {
    ...opts,
    valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY') : '',
  });
  const _date = value ? new Date(value) : null;
  const [date, setDate] = React.useState(field.defaultValue ? _date || new Date() : _date);

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
    if (v !== d) {
      if (d) {
        onChange(date);
      } else {
        onDateChange(new Date(value));
      }
    }
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
          mode="date"
          value={date}
          disabled={!conditionMet}
          // label={`${field.label}${field.optional ? '' : ' *'}`}
          onChange={date => date && onDateChange(date)}
          maxDate={field.maxDate}
          minDate={field.minDate}
          maxDate={maxDate || field.maxDate}
          minDate={minDate || field.minDate}
      />

      {/* <DatePicker
        enabled={conditionMet}
        value={date || null}
        placeholder={formCopy.SELECT_DATE}
        onChange={(e, d) => onDateChange(d)}
        maxDate={maxDate || field.maxDate}
        minDate={minDate || field.minDate}
      >
        {field.label}{field.optional ? '' : ' *'}
      </DatePicker> */}
    </>
  );
};

FieldDate.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default FieldDate;
