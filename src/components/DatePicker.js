import React from 'react';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, TouchableOpacity } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import moment from 'moment';
import Typography from '@/ui/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: theme.spacing()
  },
  labelText: {
    marginBottom: 5,
  },
  btnText: {

  }
}));

const DatePicker = ({
  children,
  labelProps,
  mode,
  value,
  onChange,
  placeholder,
  ...props
}) => {
  labelProps = { ...labelProps };

  const [show, setShow] = React.useState(false);

  const styles = useStyles();

  return (
    <>
      {!children ? null : (
        <Typography
          style={[styles.labelText]}
        >{children}</Typography>
      )}

      <TouchableOpacity
        style={[styles.root]}
        onPress={e => {
          setShow(!show);
          if (labelProps.onPress) labelProps.onPress(e);
        }}
        {...labelProps}
      >
        <Typography
          {...value ? null : { color: 'textSecondary' }}
          style={[styles.btnText]}
        >{value ? moment(value).format('LL') : placeholder}</Typography>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          {...props}
          testID="dateTimePicker"
          timeZoneOffsetInMinutes={0}
          value={value || new Date()}
          mode={mode}
          is24Hour
          display="default"
          onChange={(e, date) => {
            setShow(Platform.OS === 'ios');
            if (onChange) onChange(e, date || value);
          }}
        />
      )}
    </>
  );
};

DatePicker.propTypes = {
  mode: PropTypes.oneOf(['date', 'time']),
  children: PropTypes.node,
  labelProps: PropTypes.object,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  onChange: PropTypes.func,
};

export default DatePicker;
