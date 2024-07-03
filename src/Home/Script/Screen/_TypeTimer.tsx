import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Vibration } from 'react-native';
import { Box, Br, Text, TextInput } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';
import assets from '../../../assets';
import playSound from '../../../utils/playSound';

type TypeTimerProps = types.ScreenTypeProps & {
    
};

export function TypeTimer({}: TypeTimerProps) {
    const autoFilled = useRef(false);
    
    const ctx = useContext();
    const canAutoFill = !ctx.mountedScreens[ctx.activeScreen?.id];
    const matched = ctx.getPrepopulationData();

    const timoutRef = React.useRef<any>(null);

    const metadata = ctx.activeScreen?.data.metadata;
    const printable = ctx.activeScreen.data.printable !== false;

    const multiplier = metadata.multiplier || 1;
    const timerValue = Number(metadata.timerValue || 0);

    const [countdown, setCountDown] = React.useState(0);
    const [formError, setFormError] = React.useState('');
    const [value, setValue] = React.useState(ctx.activeScreenEntry?.values[0]?.value);

    const getFormError = React.useCallback((value: string) => {
        const v = parseFloat(`${Number(value || 0) * multiplier}`);
        const max = parseFloat(metadata.maxValue);
        const min = parseFloat(metadata.minValue);

        let e = '';
        if (!isNaN(max) && (v > max)) e = `Max value ${metadata.maxValue}`;
        if (!isNaN(min) && (v < min)) e = `Min value ${min}`;
        if (!isNaN(min) && !isNaN(max) && e) e = `The value must be greater than ${min} and lower than ${max}`;

        return e;
    }, [metadata, multiplier]);

    function onChange(val: string) {
        const e = getFormError(val);
        setValue(val);
        setFormError(e);
        ctx.setEntryValues(e ? undefined : [{
            printable,
            value: val,
            valueText: Number(val) * Number(multiplier || 1),
            calculateValue: Number(val) * Number(multiplier || 1),
            label: metadata.label,
            key: metadata.key,
            type: metadata.type || metadata.dataType,
            dataType: metadata.dataType,
            confidential: metadata.confidential,
            exportType: 'timer',
        }]);
    }

    React.useEffect(() => {
        if (countdown) {
            const s = countdown - 1;
            timoutRef.current = setTimeout(() => setCountDown(s), 1000);
            if (s === 0) {
                Vibration.vibrate((timerValue > 5 ? 5 : timerValue) * 1000);
                const play = (timeout = 0) => {
                    timeout = timeout + 500;
                    playSound(assets.alarm);
                    if (timeout < 5000) setTimeout(() => play(timeout), 500);
                }
                play();
            }
        } else {
            setCountDown(0);
        }
    }, [countdown, timerValue]);

    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            const _matched = matched[metadata.key || metadata.dataType]?.values?.value || [];
            if (_matched.length) onChange(`${_matched[0] || ''}`);
            autoFilled.current = true;
        }
    }, [canAutoFill, matched, metadata]);

    return (
        <Box>
            <TouchableWithoutFeedback
                onPress={() => {
                    if (countdown) {
                        clearTimeout(timoutRef.current);
                        setCountDown(0);
                    } else {
                        setCountDown(timerValue);
                    }
                }}
            >
                <Box
                    backgroundColor="bg.active"
                    height={250}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Text
                        color="primary"
                        variant="title1"
                        fontWeight="bold"
                    >
                        {`${`0${Math.floor((countdown || timerValue) / 60)}`.slice(-2)}:${`0${(countdown || timerValue) % 60}`.slice(-2)}`}
                    </Text>

                    <Br />

                    <Text
                        color="primary"
                        fontWeight="bold"
                    >TAP TO START</Text>
                </Box>
            </TouchableWithoutFeedback>

            <Br spacing="xl" />

            <Box
                flexDirection="row"
                alignItems="flex-end"
            >
                <Box flex={1}>
                    <TextInput
                        label={metadata.label}
                        value={value}
                        defaultValue={value}
                        errors={formError ? [formError] : []}
                        onChangeText={val => {
                            onChange(val);
                        }}
                        keyboardType="numeric"
                    />
                </Box>

                {!!multiplier && (
                    <Box marginLeft="m">
                        <Text variant="title2">x {multiplier}</Text>
                    </Box>
                )}
            </Box>

            <Br spacing="xl" />

            {!!value && (
                <Box>
                    <Text
                        fontWeight="bold"
                        variant="title1"
                        textAlign="center"
                    >{Number(value) * Number(multiplier || 1)}</Text>
                </Box>
            )}
        </Box>
    );
}
