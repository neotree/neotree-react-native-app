import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/ui/Input';

const Text = ({ field, onChange, value, conditionMet, }) => {
  return (
    <>
      <Input
        editable={conditionMet}
        value={value || ''}
        defaultValue={value || ''}
        onChange={e => {
          const value = e.nativeEvent.text;
          onChange(value);
        }}
        // placeholder={field.label}
        label={field.label}
      />
    </>
  );
};

Text.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default Text;
