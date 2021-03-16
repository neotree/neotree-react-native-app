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

  let maxDecimals = 0;
  if (field.format) maxDecimals = `${field.format}`.replace(/[^#]+/gi, '').length;

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
            autoCapitalize="none"
            autoCorrect={false}
            onChange={e => {
              const value = e.nativeEvent.text;
              let err = null;
              if (value) {
                const v = Number(value);
                const decimals = value.split('.').filter((n, i) => i > 0).join('');
                if (value.indexOf(' ') > -1) {
                  err = 'No spaces allowed'
                } else if (isNaN(v)) {
                  err = 'Input is not a number';
                } else if (field.maxValue && (v > field.maxValue)) {
                  err = `Max value ${field.maxValue}`;
                } else if (field.minValue && (v < field.minValue)) {
                  err = `Min value ${field.minValue}`;
                } else if (maxDecimals && (decimals.length > maxDecimals)) {
                  err = `Number should have only ${maxDecimals} decimal places.`;
                } else if (!maxDecimals && value.indexOf('.') > -1) {
                  err = 'Decimal places not allowed.'
                }
              }
              setError(err);
              onChange(value, { error: err, valueText: value });
            }}
            // placeholder={field.label}
            // label={`${field.label}${field.optional ? '' : ' *'}`}
            keyboardType={maxDecimals ? 'decimal-pad' : 'numeric'}
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
