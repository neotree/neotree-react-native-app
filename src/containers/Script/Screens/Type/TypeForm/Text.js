import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/ui/Input';

const Text = ({ field }) => {
  return (
    <>
      <Input
        value=""
        placeholder={field.label}
        label={field.label}
      />
    </>
  );
};

Text.propTypes = {
  field: PropTypes.object.isRequired
};

export default Text;
