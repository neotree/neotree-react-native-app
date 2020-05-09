import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';

const DropDown = ({ field }) => {
  return (
    <>
      <Typography
        color="secondary"
        variant="h1"
      >{field.dataType}</Typography>
    </>
  );
};

DropDown.propTypes = {
  field: PropTypes.object.isRequired
};

export default DropDown;
