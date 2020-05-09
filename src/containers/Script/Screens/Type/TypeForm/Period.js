import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';

const Period = ({ field }) => {
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
  field: PropTypes.object.isRequired
};

export default Period;
