import React from 'react';
import { useTheme, View, Text, Br, TextField } from '@/components/ui';
import { TouchableWithoutFeedback, Vibration } from 'react-native';
import * as copy from '@/constants/copy/script';
import playSound from '@/utils/playSound';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../../types';

export function Timer(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const timeoutRef = React.useRef(null);
    const metadata = { ...activeScreen.data.metadata };
    const multiplier = metadata.multiplier || 1;
    const timerValue = Number(metadata.timerValue || 0);

    const [countdown, setCountDown] = React.useState(0);
    const [formError, setFormError] = React.useState(null);
    const [_value, setValue] = React.useState('');

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
                        label={metadata.label}
                        variant="outlined"
                        color={formError ? 'error' : 'primary'}
                        value={_value || ''}
                        defaultValue={_value || ''}
                        onChange={e => {
                            setValue(e.nativeEvent.text);
                            // const value = e.nativeEvent.text * multiplier;
                            // setEntry({ values: { value, valueText: value, } });
                        }}
                        keyboardType="numeric"
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
