import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';

const Text = ({ field }) => {
  return (
    <>
      <Typography
        color="secondary"
        variant="h1"
      >{field.dataType}</Typography>
    </>
  );
};

Text.propTypes = {
  field: PropTypes.object.isRequired
};

export default Text;
