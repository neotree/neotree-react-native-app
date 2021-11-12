import React from 'react';
import { useTheme, View, Text, Br, TextField } from '@/components/ui';
import { TouchableWithoutFeedback, Vibration } from 'react-native';
import * as copy from '@/constants/copy/script';
import playSound from '@/utils/playSound';
import { useScriptContext } from '../../Context';
import { Entry, ScreenComponentProps } from '../../types';

export function Timer({
    setEntry: onChange,
    canAutoFill,
}: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen, activeScreenCachedEntry: value, autoFill, } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };

    const timeoutRef = React.useRef(null);
    const multiplier = metadata.multiplier || 1;
    const timerValue = Number(metadata.timerValue || 0);

    const [countdown, setCountDown] = React.useState(0);
    const [formError, setFormError] = React.useState(null);
    const [_value, setValue] = React.useState('');
    const [entry, _setEntry] = React.useState<Partial<Entry>>(value || { values: [] });
    const setEntry = (data: any = {}) => {
        const { values, ...e } = data;
        _setEntry(prev => ({
        ...prev,
        ...e,
        values: [{
            label: metadata.label,
            key: metadata.key,
            type: metadata.type || metadata.dataType,
            dataType: metadata.dataType,
            confidential: metadata.confidential,
            ...values,
        }]
        }));
    };

    React.useEffect(() => {
        if (entry.values[0] && entry.values[0].value) {
            setValue(`${parseFloat(`${entry.values[0].value / multiplier}`)}`);
        }
    }, [entry, value]);

    React.useEffect(() => {
        const v = formError ? undefined :
            !entry.values.filter(v => v.value).length ? undefined : entry;
        onChange(v);
    }, [entry, formError]);

    React.useEffect(() => {
        if (_value) {
            const v = parseFloat(`${Number(_value) * multiplier}`);
            const max = parseFloat(metadata.maxValue);
            const min = parseFloat(metadata.minValue);

            let e = null;
            if (!isNaN(max) && (v > max)) e = `Max value ${metadata.maxValue}`;
            if (!isNaN(min) && (v < min)) e = `Min value ${min}`;
            if (!isNaN(min) && !isNaN(max) && e) e = `The value must be greater than ${min} and lower than ${max}`;
            setFormError(e);
        }
    }, [_value]);

    React.useEffect(() => {
        if (countdown) {
        const s = countdown - 1;
        timeoutRef.current = setTimeout(() => setCountDown(s), 1000);
        if (s === 0) {
            Vibration.vibrate((timerValue > 5 ? 5 : timerValue) * 1000);
            const play = (timeout = 0) => {
            timeout = timeout + 500;
            playSound(require('@/assets/sounds/alarm.mp3'));
            if (timeout < 5000) setTimeout(() => play(timeout), 500);
            }
            play();
        }
        } else {
        setCountDown(0);
        }
    }, [countdown, timerValue]);

    React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const autoFillFields = React.useCallback(() => {
        if (autoFill.session && canAutoFill) {
        const autoFillObj = autoFill.session.data.entries[metadata.key];
        let autoFillVal = null;
        if (autoFillObj) {
            autoFillVal = autoFillObj.values.value[0] ;
        }
        setEntry({
            values: { value: autoFillVal, valueText: autoFillVal, },
        });
        }
    }, [canAutoFill, autoFill, metadata, entry]);

    React.useEffect(() => { autoFillFields(); }, [autoFill]);

    return (
        <>
            <TouchableWithoutFeedback
                onPress={() => {
                    if (countdown) {
                        clearTimeout(timeoutRef.current);
                        setCountDown(0);
                    } else {
                        setCountDown(timerValue);
                    }
                }}
            >
                <View
                    style={{
                        backgroundColor: 'rgba(41, 128, 185,.2)',
                        minHeight: 300,
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        color="primary"
                        style={{ textAlign: 'center' }}
                        variant="h5"
                    >
                        {`${`0${Math.floor((countdown || timerValue) / 60)}`.slice(-2)}:${`0${(countdown || timerValue) % 60}`.slice(-2)}`}
                    </Text>

                    <Br /><Br />

                    <Text
                        color="primary"
                        variant="h6"
                        style={{ textAlign: 'center' }}
                    >{countdown ? copy.STOP_TIMER : copy.START_TIMER}</Text>
                </View>
            </TouchableWithoutFeedback>

            <Br /><Br /><Br /><Br />

            <View
                style={{ flexDirection: 'row', alignItems: 'center' }}
            >
                <View style={{ flex: 1 }}>
                    <TextField
                        variant="outlined"
                        label={metadata.label}
                        value={_value || ''}
                        defaultValue={_value || ''}
                        onChange={e => {
                            const _value = e.nativeEvent.text;
                          setValue(_value);
                          const value = !_value ? null : Number(e.nativeEvent.text) * multiplier;
                          setEntry({ values: { value, valueText: value, } });
                        }}
                        keyboardType="numeric"
                        helperText={formError}
                        error={formError ? true : false}
                    />
                </View>
                {!!multiplier && <Text style={{ marginLeft: theme.spacing() }}>{` x ${multiplier}`}</Text>}
            </View>

            {!!_value && (
                <>
                    <Br />
                    <Text
                        style={{ textAlign: 'center' }}
                        variant="h5"
                    >
                        {`${Number(_value) * Number(multiplier)}`}
                    </Text>
                </>
            )}
        </>
    );
}
