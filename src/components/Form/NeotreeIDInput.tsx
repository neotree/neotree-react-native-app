import React, { useState } from 'react';
import { TextInput as RNTextInput } from "react-native";
import { generateUID, validateUID } from '@/src/utils/uid';
import { Br } from '../Br';
import { Box, Text } from '../Theme';
import { TextInput } from './TextInput';

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
    generatedUID,
}: NeotreeIDInputProps & { generatedUID?: string; }) {
    disabled = disabled;

    const [mounted, setMounted] = React.useState(false);

    const firstHalfRef = React.useRef<RNTextInput>(null);
    const lastHalfRef = React.useRef<RNTextInput>(null);

    const getDefault = () => {
        const _uid = autoGenerateValue ? (defaultValue || generatedUID || '') : '';
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
    generatedUID: generatedUidProp,
    ...props
}: NeotreeIDInputProps & { generatedUID?: string; }) {
    const [generatedUID, setGeneratedUID] = useState(generatedUidProp);
    const [isReady, setIsReady] = useState(false);

    React.useEffect(() => {
        (async () => {
            if (!generatedUID) {
                const uid = await generateUID();
                setGeneratedUID(uid);
            }
            setIsReady(true);
        })();
    }, [generatedUID]);

    return !isReady ? null : (
        <Input 
            {...props}
            generatedUID={generatedUID}
        />
    );
}
