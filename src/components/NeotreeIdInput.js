import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Input, Form, Item } from '@/components/Form';
import Text from '@/components/Text';
import { useAppContext } from '@/AppContext';

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

const NeotreeIdInput = ({
  defaultValue,
  label,
  optional,
  onChange,
  value,
  disabled,
}) => {
  const { state: { application: { uid_prefix, total_sessions_recorded, } } } = useAppContext();
  const uid = `${uid_prefix}-${`000${total_sessions_recorded + 1}`.slice(-4)}`;

  const firstHalfRef = React.useRef(null);
  const lastHalfRef = React.useRef(null);

  const getDefault = () => {
    const _uid = defaultValue ? (uid || '') : '';
    const [firstHalf, lastHalf] = _uid.split('-');
    return { uid: _uid, firstHalf: firstHalf || '', lastHalf: lastHalf || '', };
  };

  const [_defaultVal] = React.useState(getDefault());
  const [firstHalf, setFirstHalf] = React.useState(_defaultVal.firstHalf);
  const [lastHalf, setLastHalf] = React.useState(_defaultVal.lastHalf);

  const _value = `${firstHalf}-${lastHalf}`;
  const { firstHalfIsValid, lastHalfIsValid, firstHalfHasForbiddenChars, lastHalfHasForbiddenChars } = validateUID(_value);

  React.useEffect(() => {
    // if (firstHalf.length === 4) lastHalfRef.current._root.focus();
  }, [firstHalf]);

  React.useEffect(() => {
    const v = validateUID(_value).isValid ? _value : null; // (value || _defaultVal.uid);
    if (v !== value) onChange(v, { error: null, valueText: v, });
  });

  React.useEffect(() => {
    if (value) {
      const [_firstHalf, _lastHalf] = (value || '').split('-');
      setFirstHalf(_firstHalf || _defaultVal.firstHalf);
      setLastHalf(_lastHalf || _defaultVal.lastHalf);
    }
  }, [value]);

  const disableLastHalf = !(!disabled && firstHalfIsValid);
  const error = !(firstHalfIsValid && lastHalfIsValid && !disabled) ? null : (_value.length < 9 ? 'ID must have 8 characters' : null);

  return (
    <>
      <Text
        style={[
          (firstHalfIsValid && lastHalfIsValid && !error) ? {} : { color: '#b20008' },
          disabled ? { color: '#999' } : {},
        ]}
      >{label}{optional ? '' : ' *'}</Text>

      <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }]}>
        <View style={[{ flex: 1 }]}>
          <Form>
            <Item error={!firstHalfIsValid ? true : false} disabled={disabled}>
              <Input
                autoCorrect={false}
                ref={firstHalfRef}
                maxLength={4}
                autoCapitalize="characters"
                editable={!disabled}
                value={firstHalf}
                placeholder="ABC2"
                onChange={e => {
                  const value = e.nativeEvent.text;
                  setFirstHalf(value);
                }}
                // placeholder={label}
                // label={`${label}${optional ? '' : ' *'}`}
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
                autoCorrect={false}
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
                // placeholder={label}
                label={`${label}${optional ? '' : ' *'}`}
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

NeotreeIdInput.propTypes = {
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  optional: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  disabled: PropTypes.bool,
};

export default NeotreeIdInput;
