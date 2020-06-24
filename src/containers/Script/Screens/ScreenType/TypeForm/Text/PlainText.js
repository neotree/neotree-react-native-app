import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Item } from 'native-base';
import Text from '@/components/Text';

const PlainText = ({ field, onChange, value, conditionMet, }) => {
  const [error] = React.useState(null);

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
            autoCapitalize="characters"
            editable={conditionMet}
            value={value || ''}
            defaultValue={value || ''}
            onChange={e => {
              const value = e.nativeEvent.text;
              onChange(value);
            }}
            // placeholder={field.label}
            // label={`${field.label}${field.optional ? '' : ' *'}`}
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

PlainText.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default PlainText;
