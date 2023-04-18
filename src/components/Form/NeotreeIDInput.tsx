import React from 'react';
import { TextInput as RNTextInput } from "react-native";
import { getApplication } from '../../data';
import * as types from '../../types';
import { Br } from '../Br';
import { Box, Text } from '../Theme';
import { TextInput } from './TextInput';

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

export type NeotreeIDInputProps = {
    autoGenerateValue?: boolean;
    label?: string;
    onChange: (value: string) => void;
    value?: any;
    disabled?: boolean;
    defaultValue?: string;
};

function Input({
    defaultValue,
    autoGenerateValue,
    label,
    onChange,
    value,
    disabled,
    application: { uid_prefix, total_sessions_recorded, },
}: NeotreeIDInputProps & { application: types.Application; }) {
    disabled = disabled;

    const uid = `${uid_prefix}-${`000${(total_sessions_recorded || 0) + 1}`.slice(-4)}`;

    const [mounted, setMounted] = React.useState(false);

    const firstHalfRef = React.useRef<RNTextInput>(null);
    const lastHalfRef = React.useRef<RNTextInput>(null);
    const [valueInitialised, setValueInitialised] = React.useState(false);

    const getDefault = () => {
        const _uid = autoGenerateValue ? (defaultValue || uid || '') : '';
        const [firstHalf, lastHalf] = _uid.split('-');
        return { uid: _uid, firstHalf: firstHalf || '', lastHalf: lastHalf || '', };
    };

    const [_defaultVal] = React.useState(getDefault());
    const [firstHalf, setFirstHalf] = React.useState(`${value || ''}`.substring(0, 4) || _defaultVal.firstHalf);
    const [lastHalf, setLastHalf] = React.useState(`${value || ''}`.substring(5, 9) || _defaultVal.lastHalf);
    const [uidValue, setUIDValue] = React.useState('');

    const _value = `${firstHalf}-${lastHalf}`;
    const { firstHalfIsValid, lastHalfIsValid, firstHalfHasForbiddenChars, lastHalfHasForbiddenChars } = validateUID(_value);

    React.useEffect(() => {
        // if (firstHalf.length === 4) lastHalfRef.current._root.focus();
    }, [firstHalf]);

    // React.useEffect(() => {
    //     const v = validateUID(_value).isValid ? _value : ''; // (value || _defaultVal.uid);
    //     if (!valueInitialised || (v !== _value)) {
    //         onChange(v);
    //         setValueInitialised(true);
    //     }
    // }, [_value, valueInitialised]);

    React.useEffect(() => {
        const _value = `${firstHalf}-${lastHalf}`;
        const v = validateUID(_value).isValid ? _value : ''; // (value || _defaultVal.uid);
        setUIDValue(v);
    }, [firstHalf, lastHalf]);

    React.useEffect(() => { onChange(uidValue); }, [uidValue]);

    React.useEffect(() => {
        if (value) {
            const [_firstHalf, _lastHalf] = (value || '').split('-');
            setFirstHalf(_firstHalf || _defaultVal.firstHalf);
            setLastHalf(_lastHalf || _defaultVal.lastHalf);
        } else if (mounted) {
            // setFirstHalf('');
            // setLastHalf('');
        }
    }, [value, mounted]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const disableLastHalf = !(!disabled && firstHalfIsValid);
    const error = !(firstHalfIsValid && lastHalfIsValid && !disabled) ? null : (_value.length < 9 ? 'ID must have 8 characters' : null);

    return (
        <Box>
            {!!label && (
                <>
                    <Text>{label}</Text>
                    <Br spacing="s" />
                </>
            )}

            <Box
                flexDirection="row"
            >
                <Box
                    flex={1}
                >
                    <TextInput
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
                        errors={!firstHalfHasForbiddenChars ? undefined : ['Allowed characters: ABCDEF0123456789']}
                    />
                </Box>

                <Box margin="s" />

                <Box
                    flex={1}
                >
                    <TextInput
                        autoCorrect={false}
                        ref={lastHalfRef}
                        onKeyPress={e => {
                            if (e.nativeEvent.key === 'Backspace' && !lastHalf) {
                                setFirstHalf(firstHalf.substr(0, firstHalf.length - 1));
                                firstHalfRef.current?.focus();
                            }
                        }}
                        maxLength={4}
                        keyboardType="numeric"
                        editable={!(disabled || disableLastHalf)}
                        value={lastHalf}
                        placeholder="0123"
                        onChange={e => {
                            const value = e.nativeEvent.text;
                            setLastHalf(value);
                        }}
                        errors={!lastHalfHasForbiddenChars ? undefined : ['Allowed characters: 0123456789']}
                    />
                </Box>
            </Box>

            {!error ? null : (
                <>
                    <Br spacing="s" />
                    <Text color="error">
                        {error}
                    </Text>
                </>
            )}
        </Box>
    );
}

export function NeotreeIDInput({
    application: applicationProp,
    ...props
}: NeotreeIDInputProps & { application?: null | types.Application; }) {
    const [application, setApplication] = React.useState<null | types.Application>(applicationProp || null);

    React.useEffect(() => {
        (async () => {
            if (!applicationProp) {
                const app = await getApplication();
                setApplication(app);
            }
        })();
    }, [applicationProp]);

    return !application ? null : (
        <Input 
            {...props}
            application={application}
        />
    );
}
