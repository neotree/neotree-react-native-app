import React from 'react';
import { useTheme, View, TextField, Text } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';
import { ALLOWED_UID_CHARS_ERR_PREFIX } from '@/constants/copy/script';
import { ALLOWED_UID_CHARS } from '@/constants';

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

export function UID({
    field,
    onChange,
    value,
    conditionMet,
}: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { application: { uid_prefix, total_sessions_recorded } } = useScriptContext();
    const uid = `${uid_prefix}-${`000${total_sessions_recorded + 1}`.slice(-4)}`;

    const firstHalfRef = React.useRef(null);
    const lastHalfRef = React.useRef(null);

    const getDefault = () => {
        const _uid = field.defaultValue ? (uid || '') : '';
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

    const disableLastHalf = !(conditionMet && firstHalfIsValid);
    const error = !(firstHalfIsValid && lastHalfIsValid && conditionMet) ? null : (_value.length < 9 ? 'ID must have 8 characters' : null);

    return (
        <>
            <View
                style={{ flexDirection: 'row' }}
            >
                <View
                    style={{ flex: 1 }}
                >
                    <TextField 
                        color={(firstHalfHasForbiddenChars || error) ? 'error' : 'primary'}
                        variant="outlined"
                        placeholder="ABC2"
                        autoCorrect={false}
                        ref={firstHalfRef}
                        maxLength={4}
                        autoCapitalize="characters"
                        editable={conditionMet}
                        value={firstHalf}
                        onChange={e => {
                            const value = e.nativeEvent.text;
                            setFirstHalf(value);
                        }}
                        error={(firstHalfHasForbiddenChars || error) ? true : false}
                        helperText={!firstHalfHasForbiddenChars ? undefined : `${ALLOWED_UID_CHARS_ERR_PREFIX} ${ALLOWED_UID_CHARS}`}
                    />
                </View>

                <Text
                    color="disabled"
                    style={{ marginHorizontal: theme.spacing() }}
                >-</Text>

                <View
                    style={{ flex: 1 }}
                >
                    <TextField 
                        color={(firstHalfHasForbiddenChars || error) ? 'error' : 'primary'}
                        variant="outlined"
                        placeholder="0123"
                        autoCorrect={false}
                        ref={lastHalfRef}
                        onKeyPress={e => {
                            if (e.nativeEvent.key === 'Backspace' && !lastHalf) {
                                setFirstHalf(firstHalf.substr(0, firstHalf.length - 1));
                                firstHalfRef.current.focus();
                            }
                        }}
                        maxLength={4}
                        keyboardType="numeric"
                        editable={!disableLastHalf}
                        value={lastHalf}
                        onChange={e => {
                            const value = e.nativeEvent.text;
                            setLastHalf(value);
                            if (!value.length) firstHalfRef.current.focus();
                        }}
                        error={(lastHalfHasForbiddenChars || error) ? true : false}
                        helperText={!lastHalfHasForbiddenChars ? undefined : `${ALLOWED_UID_CHARS_ERR_PREFIX} ${ALLOWED_UID_CHARS}`}
                    />
                </View>
            </View>
        </>
    );
}
