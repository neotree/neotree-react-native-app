import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Item } from 'native-base';
import Text from '@/components/Text';

const NumberField = ({
  field,
  onChange,
  value,
  conditionMet,
}) => {
  const [error, setError] = React.useState(null);

  return (
    <>
      <Form>
        <Text
          style={[
            error ? { color: '#b20008' } : {},
            !conditionMet ? { color: '#999' } : {},
          ]}
        >{field.label}</Text>
        <Item regular error={error ? true : false}>
          <Input
            editable={conditionMet}
            value={value || ''}
            defaultValue={value || ''}
            onChange={e => {
              const value = e.nativeEvent.text;
              let err = null;
              if (value) {
                const v = Number(value);
                if (isNaN(v)) err = 'Input is not a number';
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
        </Item>
      </Form>

      {!error ? null : (
        <>
          <Text style={{ color: '#b20008' }}>
            {error}
          </Text>
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
