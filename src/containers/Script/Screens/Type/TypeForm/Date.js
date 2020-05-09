import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from '@/components/DatePicker';
import formCopy from '@/constants/copy/form';

const FieldDate = ({ field }) => {
  const [date, setDate] = React.useState(null);

  return (
    <>
      <DatePicker
        value={date}
        placeholder={formCopy.SELECT_DATE}
        onChange={(e, date) => setDate(date)}
      >
        {field.label}
      </DatePicker>
    </>
  );
};

FieldDate.propTypes = {
  field: PropTypes.object.isRequired
};

export default FieldDate;
