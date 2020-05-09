import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/ui/Input';

const Number = ({ field }) => {
  return (
    <>
      <Input
        value=""
        placeholder={field.label}
        label={field.label}
        keyboardType="numeric"
      />
    </>
  );
};

Number.propTypes = {
  field: PropTypes.object.isRequired
};

export default Number;
