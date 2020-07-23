import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const FieldDate = ({ field, onChange: _onChange, value, conditionMet, }) => {
  const onChange = (d, opts) => _onChange(d, {
    ...opts,
    valueText: d ? require('moment')(new Date(d)).format('DD MMM, YYYY') : '',
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
      <DatePicker
        enabled={conditionMet}
        value={date || null}
        placeholder={formCopy.SELECT_DATE}
        onChange={onDateChange}
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
