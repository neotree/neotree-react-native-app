import React from 'react';
import PropTypes from 'prop-types';
import { View, Platform, Vibration } from 'react-native';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import Typography from '@/ui/Typography';
import Input from '@/ui/Input';
import makeStyles from '@/ui/styles/makeStyles';
import formCopy from '@/constants/copy/form';

const useStyles = makeStyles((theme) => ({
  timerView: {
    backgroundColor: theme.transparentize(theme.palette.primary.main, 0.2),
    padding: theme.spacing(),
    minHeight: 150,
    textAlign: 'center',
    justifyContent: 'center',
  },
  timer: {
    textAlign: 'center',
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
    marginLeft: theme.spacing(),
  },
  value: {
    textAlign: 'center',
  }
}));

const Timer = ({ screen, context }) => {
  const { metadata } = screen.data;

  const _value = context.state.form[screen.id] ? context.state.form[screen.id].form.value : '';

  const styles = useStyles();

  const [timerIsRunning, setTimerIsRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(metadata.timerValue || 0);
  const [value, setValue] = React.useState(_value);
  const [formError, setFormError] = React.useState(null);

  React.useEffect(() => {
    context.setForm({
      [screen.id]: formError || !value ? undefined : {
        key: metadata ? metadata.key : undefined,
        form: { key: metadata.key, value }
      }
    });
  }, [formError, value]);

  React.useEffect(() => {
    if (value) {
      const v = Number(value);
      let e = null;
      if (metadata.maxValue && (v > metadata.maxValue)) e = `Max value ${metadata.maxValue}`;
      if (metadata.minValue && (v > metadata.minValue)) e = `Min value ${metadata.minValue}`;
      setFormError(e);
    }
  }, [value]);

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
          <Typography
            variant="h1"
            style={[styles.timer]}
          >
            {`${`0${Math.floor(seconds / 60)}`.slice(-2)}:${`0${seconds % 60}`.slice(-2)}`}
          </Typography>
          <Button
            onPress={() => setTimerIsRunning(!timerIsRunning)}
          >
            {timerIsRunning ? formCopy.STOP_TIMER : formCopy.START_TIMER}
          </Button>
        </View>

        <Divider spacing={2} border={false} />

        <View
          style={[styles.form]}
        >
          <View style={[styles.input]}>
            <Input
              label={metadata.label}
              size="xl"
              value={value || ''}
              defaultValue={value || ''}
              onChange={e => {
                const value = e.nativeEvent.text;
                setValue(value);
              }}
              keyboardType="numeric"
            />
          </View>

          {!metadata.multiplier ? null : (
            <Typography
              color="textSecondary"
              style={[styles.multiplier]}
            >
              x {metadata.multiplier}
            </Typography>
          )}
        </View>

        {!formError ? null : (
          <>
            <Divider border={false} />
            <Typography
              variant="caption"
              color="error"
            >
              {formError}
            </Typography>
          </>
        )}

        {!value ? null : (
          <>
            <Divider spacing={2} border={false} />

            <Typography
              variant="h1"
              style={[styles.value]}
            >
              {Number(value) * Number(metadata.multiplier || 1)}
            </Typography>
          </>
        )}
      </View>
    </>
  );
};

Timer.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default Timer;
