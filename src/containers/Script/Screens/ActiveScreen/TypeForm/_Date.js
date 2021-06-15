import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const FieldDate = ({ field, onChange: _onChange, value, conditionMet, }) => {
  const onChange = (d, opts) => _onChange(d, {
    ...opts,
    valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY') : '',
  });
  const _date = value ? new Date(value) : null;
  const [date, setDate] = React.useState(field.defaultValue ? _date || new Date() : _date);

  const onDateChange = (date) => {
    setDate(date);
    onChange(date.toISOString());
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

  return (
    <>
      <DatePicker
        enabled={conditionMet}
        value={date || null}
        placeholder={formCopy.SELECT_DATE}
        onChange={(e, d) => onDateChange(d)}
        maxDate={field.maxDate}
        minDate={field.minDate}
      >
        {field.label}{field.optional ? '' : ' *'}
      </DatePicker>
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
