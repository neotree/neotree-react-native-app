import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Input, Form, Item } from 'native-base';
import Text from '@/components/Text';

const NUID = ({ field, onChange, value, conditionMet, }) => {
  const [error] = React.useState(null);

  return (
    <>
      <Text
        style={[
          error ? { color: '#b20008' } : {},
          !conditionMet ? { color: '#999' } : {},
        ]}
      >{field.label}</Text>

      <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
        <View style={[{ flex: 1 }]}>
          <Form>
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
                label={`${field.label}${field.optional ? '' : ' *'}`}
              />
            </Item>
          </Form>
        </View>

        <Text style={[{ marginHorizontal: 10 }]}>-</Text>

        <View style={[{ flex: 1 }]}>
          <Form>
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
                label={`${field.label}${field.optional ? '' : ' *'}`}
              />
            </Item>
          </Form>
        </View>
      </View>

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

NUID.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default NUID;
