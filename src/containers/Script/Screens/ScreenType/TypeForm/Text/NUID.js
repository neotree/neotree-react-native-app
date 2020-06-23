import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Input, Form, Item } from '@/components/Form';
import Text from '@/components/Text';

const NUID = ({ field, onChange, value, conditionMet, }) => {
  const [_firstHalf, _lastHalf] = (value || '').split('-');

  const firstHalfRef = React.useRef(null);
  const lastHalfRef = React.useRef(null);

  const [firstHalf, setFirstHalf] = React.useState(_firstHalf || '');
  const [lastHalf, setLastHalf] = React.useState(_lastHalf || '');

  const allowedFirstHalf = /^[a-fA-F0-9]*$/gi;
  const allowedLastHalf = /^[0-9]*$/gi;
  const _value = `${firstHalf}-${lastHalf}`;

  React.useEffect(() => {
    if (firstHalf.length === 4) lastHalfRef.current._root.focus();
  }, [firstHalf]);

  React.useEffect(() => {
    const valueIsValid = (_value.length === 9) &&
      allowedFirstHalf.test(firstHalf) && allowedLastHalf.test(lastHalf);
    onChange(valueIsValid ? _value : '');
  }, [_value]);

  const disableLastHalf = !(conditionMet && allowedFirstHalf.test(firstHalf)) && (firstHalf.length < 4);
  const error = !(allowedFirstHalf.test(firstHalf) && allowedLastHalf.test(lastHalf) && conditionMet) ? null : (_value.length < 9 ? 'ID must have 8 characters' : null);

  return (
    <>
      <Text
        style={[
          (allowedFirstHalf.test(firstHalf) && allowedLastHalf.test(lastHalf) && !error) ? {} : { color: '#b20008' },
          !conditionMet ? { color: '#999' } : {},
        ]}
      >{field.label}</Text>

      <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ flex: 1 }]}>
          <Form>
            <Item error={!allowedFirstHalf.test(firstHalf) ? true : false} disabled={!conditionMet}>
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
                label={`${field.label}${field.optional ? '' : ' *'}`}
              />
            </Item>
          </Form>

          {allowedFirstHalf.test(firstHalf) ? null : (
            <>
              <Text style={{ color: '#b20008' }}>
                Allowed characters: ABCDEF
              </Text>
            </>
          )}
        </View>

        <Text style={[{ marginHorizontal: 10, marginTop: 'auto', marginBottom: 'auto' }]}>-</Text>

        <View style={[{ flex: 1 }]}>
          <Form>
            <Item error={!allowedLastHalf.test(lastHalf) ? true : false} disabled={disableLastHalf}>
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

          {allowedLastHalf.test(lastHalf) ? null : (
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
