import React from 'react';
import PropTypes from 'prop-types';
import { TouchableWithoutFeedback, View, Vibration } from 'react-native';
import Divider from '@/components/Divider';
import { Input, Form, Item } from 'native-base';
import formCopy from '@/constants/copy/form';
import Text from '@/components/Text';
import colorStyles from '@/styles/colorStyles';
import playSound from '@/utils/playSound';
import { useContext } from '../../Context';

const styles = {
  timerView: {
    backgroundColor: 'rgba(41, 128, 185,.2)',
    minHeight: 300,
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

const TypeTimer = ({ canAutoFill, screen, entry: value, setEntry: onChange }) => {
  const { state: { autoFill } } = useContext();

  const timoutRef = React.useRef(null);
  const metadata = screen.data.metadata || {};
  const multiplier = metadata.multiplier || 1;
  const timerValue = Number(metadata.timerValue || 0);

  const [countdown, setCountDown] = React.useState(0);
  const [formError, setFormError] = React.useState(null);
  const [_value, setValue] = React.useState('');
  const [entry, _setEntry] = React.useState(value || { values: [] });
  const setEntry = (data = {}) => {
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
      setValue(`${parseFloat(entry.values[0].value / multiplier)}`);
    }
  }, [entry, value]);

  React.useEffect(() => {
    const v = formError ? undefined :
      !entry.values.filter(v => v).length ? undefined : entry;
    onChange(v);
  }, [entry, formError]);

  React.useEffect(() => {
    if (_value) {
      const v = parseFloat(_value * multiplier);
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
      timoutRef.current = setTimeout(() => setCountDown(s), 1000);
      if (s === 0) {
        Vibration.vibrate((timerValue > 5 ? 5 : timerValue) * 1000);
        const play = (timeout = 0) => {
          timeout = timeout + 500;
          playSound(require('~/assets/sounds/alarm.mp3'));
          if (timeout < 5000) setTimeout(() => play(timeout), 500);
        }
        play();
      }
    } else {
      setCountDown(0);
    }
  }, [countdown, timerValue]);

  React.useEffect(() => () => clearTimeout(timoutRef.current), []);

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
      <View>
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
          <View style={[styles.timerView]}>
            <Text
              style={[colorStyles.primaryColor, styles.timer]}
            >
              {`${`0${Math.floor((countdown || timerValue) / 60)}`.slice(-2)}:${`0${(countdown || timerValue) % 60}`.slice(-2)}`}
            </Text>

            <Divider border={false} />

            <Text
              style={[
                colorStyles.primaryColor,
                { fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }
              ]}
            >{countdown ? formCopy.STOP_TIMER : formCopy.START_TIMER}</Text>
          </View>
        </TouchableWithoutFeedback>

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
                    setValue(e.nativeEvent.text);
                    const value = e.nativeEvent.text * multiplier;
                    setEntry({ values: { value, valueText: value, } });
                  }}
                  keyboardType="numeric"
                />
              </Item>
            </Form>
          </View>

          {!multiplier ? null : (
            <Text
              style={[styles.multiplier]}
            >
              x {multiplier}
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
              {Number(_value) * Number(multiplier)}
            </Text>
          </>
        )}
      </View>
    </>
  );
};

TypeTimer.propTypes = {
  screen: PropTypes.object,
  entry: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default TypeTimer;