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
        >{field.label}{field.optional ? '' : ' *'}</Text>
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
                const decimals = value.split('.').filter((n, i) => i > 0).join('');
                if (isNaN(v)) {
                  err = 'Input is not a number';
                } else if (field.maxValue && (v > field.maxValue)) {
                  err = `Max value ${field.maxValue}`;
                } else if (field.minValue && (v < field.minValue)) {
                  err = `Min value ${field.minValue}`;
                } else if (field.format && (decimals.length > Number(field.format))) {
                  err = `Number should have only ${field.format} decimal places.`;
                } else if (value.indexOf('.') > -1) {
                  err = 'Decimal places not allowed.'
                }
              }
              setError(err);
              onChange(value, { error: err, valueText: value });
            }}
            // placeholder={field.label}
            // label={`${field.label}${field.optional ? '' : ' *'}`}
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
