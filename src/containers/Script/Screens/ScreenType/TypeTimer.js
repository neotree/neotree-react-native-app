import React from 'react';
import PropTypes from 'prop-types';
import { View, Platform, Vibration } from 'react-native';
import Divider from '@/components/Divider';
import { Button, Input, Form, Item } from 'native-base';
import formCopy from '@/constants/copy/form';
import Text from '@/components/Text';

const styles = {
  timerView: {
    backgroundColor: 'rgba(41, 128, 185,.2)',
    padding: 10,
    minHeight: 150,
    textAlign: 'center',
    justifyContent: 'center',
  },
  timer: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
  },
  form: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
  },
  multiplier: {
    marginLeft: 10,
    color: '#999',
  },
  value: {
    textAlign: 'center',
    fontSize: 40,
    fontWeight: 'bold',
  }
};

const Timer = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [timerIsRunning, setTimerIsRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(metadata.timerValue || 0);
  const [formError, setFormError] = React.useState(null);
  const [entry, setEntry] = React.useState(value || { values: [] });

  const _value = entry.values[0] ? entry.values[0].value : null;

  React.useEffect(() => {
    onChange(!entry.values.filter(v => v).length ? undefined : entry);
  }, [entry]);

  React.useEffect(() => {
    if (_value) {
      const v = Number(_value);
      let e = null;
      if (metadata.maxValue && (v > metadata.maxValue)) e = `Max value ${metadata.maxValue}`;
      if (metadata.minValue && (v < metadata.minValue)) e = `Min value ${metadata.minValue}`;
      setFormError(e);
    }
  }, [_value]);

  React.useEffect(() => {
    let timeOut = null;

    if (timerIsRunning && (seconds > 0)) {
      timeOut = setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      if (timerIsRunning) {
        if (Platform.OS === 'ios') {
          Vibration.vibrate(10 * 1000);
        }
        if (Platform.OS === 'android') {
          Vibration.vibrate([1000], true);
        }
      }
      setSeconds(metadata.timerValue);
      setTimerIsRunning(false);
    }

    return () => {
      clearTimeout(timeOut);
    };
  }, [seconds, timerIsRunning]);

  return (
    <>
      <View>
        <View
          style={[styles.timerView]}
        >
          <Text
            style={[styles.timer]}
          >
            {`${`0${Math.floor(seconds / 60)}`.slice(-2)}:${`0${seconds % 60}`.slice(-2)}`}
          </Text>
          <Button
            block
            transparent
            onPress={() => setTimerIsRunning(!timerIsRunning)}
          >
            <Text>{timerIsRunning ? formCopy.STOP_TIMER : formCopy.START_TIMER}</Text>
          </Button>
        </View>

        <Divider spacing={2} border={false} />

        <View
          style={[styles.form]}
        >
          <View style={[styles.input]}>
            <Form>
              <Text style={formError ? { color: '#b20008' } : {}}>{metadata.label}</Text>
              <Item regular error={formError ? true : false}>
                <Input
                  label={metadata.label}
                  value={_value || ''}
                  defaultValue={_value || ''}
                  onChange={e => {
                    const value = e.nativeEvent.text;
                    setEntry({
                      values: [{
                        value,
                        label: metadata.label,
                        key: metadata.key,
                        type: metadata.type || metadata.dataType, 
                        dataType: metadata.dataType,
                      }]
                    });
                  }}
                  keyboardType="numeric"
                />
              </Item>
            </Form>
          </View>

          {!metadata.multiplier ? null : (
            <Text
              style={[styles.multiplier]}
            >
              x {metadata.multiplier}
            </Text>
          )}
        </View>

        {!formError ? null : (
          <>
            <Divider border={false} />
            <Text
              style={{ color: '#b20008', fontSize: 15 }}
            >
              {formError}
            </Text>
          </>
        )}

        {!_value ? null : (
          <>
            <Divider spacing={2} border={false} />

            <Text
              style={[styles.value]}
            >
              {Number(_value) * Number(metadata.multiplier || 1)}
            </Text>
          </>
        )}
      </View>
    </>
  );
};

Timer.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Timer;
