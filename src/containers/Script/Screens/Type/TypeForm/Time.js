import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';

const Time = ({ field }) => {
  return (
    <>
      <Typography
        color="secondary"
        variant="h1"
      >{field.dataType}</Typography>
    </>
  );
};

Time.propTypes = {
  field: PropTypes.object.isRequired
};

export default Time;
