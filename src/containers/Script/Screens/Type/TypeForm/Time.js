import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const Time = ({ field }) => {
  const [date, setDate] = React.useState(null);

  return (
    <>
      <DatePicker
        mode="time"
        value={date}
        placeholder={formCopy.SELECT_TIME}
        onChange={(e, date) => setDate(date)}
      >
        {field.label}
      </DatePicker>
    </>
  );
};

Time.propTypes = {
  field: PropTypes.object.isRequired
};

export default Time;
