import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/ui/Input';
import Divider from '@/ui/Divider';
import Typography from '@/ui/Typography';

const NumberField = ({
  field,
  onChange,
  value,
  conditionMet,
}) => {
  const [error, setError] = React.useState(null);

  return (
    <>
      <Input
        editable={conditionMet}
        value={value || ''}
        defaultValue={value || ''}
        onChange={e => {
          const value = e.nativeEvent.text;
          let err = null;
          if (value) {
            const v = Number(value);
            if (field.maxValue && (v > field.maxValue)) err = `Max value ${field.maxValue}`;
            if (field.minValue && (v < field.minValue)) err = `Min value ${field.minValue}`;
          }
          setError(err);
          onChange(value, err);
        }}
        // placeholder={field.label}
        label={`${field.label}${field.optional ? '' : ' *'}`}
        keyboardType="numeric"
      />

      {!error ? null : (
        <>
          <Divider border={false} />
          <Typography
            variant="caption"
            color="error"
          >
            {error}
          </Typography>
        </>
      )}
    </>
  );
};

NumberField.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default NumberField;
