import React from 'react';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, View } from 'react-native';
import moment from 'moment';
import { Form, Item, Text } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

const styles = {
  errorText: { color: '#b20008' },
  text: { flex: 1, },
  disabledText: { color: '#ccc' },
  formItem: {
    paddingVertical: 15,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
};

const DatePicker = ({
  children,
  labelProps,
  mode,
  value,
  onChange,
  placeholder,
  enabled,
  formatDate,
  editable,
  maxDate,
  minDate,
  ...props
}) => {
  enabled = enabled !== false;
  editable = editable !== false;
  labelProps = { ...labelProps };

  const [show, setShow] = React.useState(false);
  const [error] = React.useState(null);

  return (
    <>
      <Form>
        {!children ? null : (
          <Text
            style={[
              enabled ? null : styles.disabledText,
              !error ? null : styles.errorText
            ]}
          >{children}</Text>
        )}

        <Item
          regular
          style={[styles.formItem]}
          error={error ? true : false}
          disabled={!enabled}
          onPress={e => {
            if (editable) setShow(!show);
            if (labelProps.onPress) labelProps.onPress(e);
          }}
        >
          <Text
            style={[
              styles.text,
              enabled ? null : styles.disabledText,
              value ? null : { color: '#ccc' },
            ]}
          >
            {!value ? placeholder : (formatDate ?
              formatDate(value) : moment(value).format(mode === 'time' ? 'LT' : 'LL')
            )}
          </Text>
          <MaterialIcons size={24} color="black" style={[enabled ? null : { color: '#ccc' }]} name="arrow-drop-down" />
        </Item>
      </Form>

      {editable && (enabled !== false) && show && (
        <View style={{ flex: 1 }}>
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
            maximumDate={!maxDate ? null : maxDate === 'date_now' ? new Date() : new Date(maxDate)}
            minimumDate={!minDate ? null : minDate === 'date_now' ? new Date() : new Date(minDate)}
          />
        </View>
      )}
    </>
  );
};

DatePicker.propTypes = {
  enabled: PropTypes.bool,
  mode: PropTypes.oneOf(['date', 'time']),
  children: PropTypes.node,
  labelProps: PropTypes.object,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  onChange: PropTypes.func,
  formatDate: PropTypes.func,
  editable: PropTypes.bool,
};

export default DatePicker;
