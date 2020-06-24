import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Input, Form, Item } from '@/components/Form';
import Text from '@/components/Text';

const validateUID = (value = '') => {
  const allowedFirstHalf = /^[a-fA-F0-9]*$/gi;
  const allowedLastHalf = /^[0-9]*$/gi;
  const [_firstHalf, _lastHalf] = (value || '').split('-');

  const firstHalfHasForbiddenChars = !allowedFirstHalf.test(_firstHalf);
  const lastHalfHasForbiddenChars = !allowedLastHalf.test(_lastHalf);
  const firstHalfIsValid = (_firstHalf.length === 4) && !firstHalfHasForbiddenChars;
  const lastHalfIsValid = (_lastHalf.length === 4) && !lastHalfHasForbiddenChars;

  return {
    firstHalfHasForbiddenChars,
    lastHalfHasForbiddenChars,
    firstHalfIsValid,
    lastHalfIsValid,
    isValid: firstHalfIsValid && lastHalfIsValid,
  };
};

const NUID = ({ field, onChange, value, conditionMet, }) => {
  const [_firstHalf, _lastHalf] = (value || '').split('-');

  const firstHalfRef = React.useRef(null);
  const lastHalfRef = React.useRef(null);

  const [firstHalf, setFirstHalf] = React.useState(_firstHalf || '');
  const [lastHalf, setLastHalf] = React.useState(_lastHalf || '');

  const _value = `${firstHalf}-${lastHalf}`;
  const { firstHalfIsValid, lastHalfIsValid, firstHalfHasForbiddenChars, lastHalfHasForbiddenChars } = validateUID(_value);

  React.useEffect(() => {
    if (firstHalf.length === 4) lastHalfRef.current._root.focus();
  }, [firstHalf]);

  React.useEffect(() => {
    onChange(validateUID(_value).isValid ? _value : '');
  }, [_value]);

  const disableLastHalf = !(conditionMet && firstHalfIsValid);
  const error = !(firstHalfIsValid && lastHalfIsValid && conditionMet) ? null : (_value.length < 9 ? 'ID must have 8 characters' : null);

  return (
    <>
      <Text
        style={[
          (firstHalfIsValid && lastHalfIsValid && !error) ? {} : { color: '#b20008' },
          !conditionMet ? { color: '#999' } : {},
        ]}
      >{field.label}{field.optional ? '' : ' *'}</Text>

      <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ flex: 1 }]}>
          <Form>
            <Item error={!firstHalfIsValid ? true : false} disabled={!conditionMet}>
              <Input
                ref={firstHalfRef}
                maxLength={4}
                autoCapitalize="characters"
                editable={conditionMet}
                value={firstHalf}
                placeholder="ABC2"
                onChange={e => {
                  const value = e.nativeEvent.text;
                  setFirstHalf(value);
                }}
                // placeholder={field.label}
                // label={`${field.label}${field.optional ? '' : ' *'}`}
              />
            </Item>
          </Form>

          {!firstHalfHasForbiddenChars ? null : (
            <>
              <Text style={{ color: '#b20008' }}>
                Allowed characters: ABCDEF0123456789
              </Text>
            </>
          )}
        </View>

        <Text style={[{ marginHorizontal: 10, marginTop: 'auto', marginBottom: 'auto' }]}>-</Text>

        <View style={[{ flex: 1 }]}>
          <Form>
            <Item
              error={!lastHalfIsValid ? true : false}
              disabled={disableLastHalf}
            >
              <Input
                ref={lastHalfRef}
                onKeyPress={e => {
                  if (e.nativeEvent.key === 'Backspace' && !lastHalf) {
                    setFirstHalf(firstHalf.substr(0, firstHalf.length - 1));
                    firstHalfRef.current._root.focus();
                  }
                }}
                maxLength={4}
                keyboardType="numeric"
                disabled={disableLastHalf}
                editable={!disableLastHalf}
                value={lastHalf}
                placeholder="0123"
                onChange={e => {
                  const value = e.nativeEvent.text;
                  setLastHalf(value);
                }}
                // placeholder={field.label}
                label={`${field.label}${field.optional ? '' : ' *'}`}
              />
            </Item>
          </Form>

          {!lastHalfHasForbiddenChars ? null : (
            <>
              <Text style={{ color: '#b20008' }}>
                Allowed characters: 0123456789
              </Text>
            </>
          )}
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
