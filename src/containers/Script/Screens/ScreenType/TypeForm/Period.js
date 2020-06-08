import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';

const Period = ({ field, onChange, value }) => {
  return (
    <>
      <Typography
        color="secondary"
        variant="h1"
      >{field.dataType}</Typography>
    </>
  );
};

Period.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  enabled: PropTypes.bool,
};

export default Period;
