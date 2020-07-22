import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';
import { View } from 'react-native';
import Text from '@/components/Text';

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

const DateTime = ({ field, onChange: _onChange, value, conditionMet, }) => {
  const onChange = (d, opts) => _onChange(d, {
    ...opts,
    valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY HH:MM') : '',
  });
  const [date, setDate] = React.useState(field.defaultValue ? value || new Date() : value);

  const onDateChange = (e, date) => {
    setDate(date);
    onChange(date);
  };

  React.useEffect(() => {
    const v = value ? new Date(value).toString() : null;
    const d = date ? new Date(date).toString() : null;
    if (v !== d) onChange(date);
  });

  return (
    <>
      {!field.label ? null : (
        <Text
          {...conditionMet ? null : { style: { color: '#ccc' } }}
        >
          {field.label}{field.optional ? '' : ' *'}
        </Text>
      )}

      <View style={[styles.gridContainer]}>
        <View style={[styles.gridItem]}>
          <DatePicker
            enabled={conditionMet}
            value={date || null}
            placeholder={formCopy.SELECT_DATE}
            onChange={onDateChange}
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
      </View>
    </>
  );
};

DateTime.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default DateTime;
