import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const Time = ({ field, onChange, value, conditionMet, }) => {
  return (
    <>
      <DatePicker
        enabled={conditionMet}
        mode="time"
        value={value || null}
        placeholder={formCopy.SELECT_TIME}
        onChange={(e, time) => onChange(time)}
      >
        {field.label}
      </DatePicker>
    </>
  );
};

Time.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default Time;
