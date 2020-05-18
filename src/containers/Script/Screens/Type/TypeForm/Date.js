import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const FieldDate = ({ field, onChange, value, conditionMet, }) => {
  return (
    <>
      <DatePicker
        enabled={conditionMet}
        value={value || null}
        placeholder={formCopy.SELECT_DATE}
        onChange={(e, date) => onChange(date)}
      >
        {field.label}
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
