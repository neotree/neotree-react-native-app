import React from 'react';
import PropTypes from 'prop-types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, View } from 'react-native';
import moment from 'moment';
import { Form, Item, Text, Icon } from 'native-base';

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
  ...props
}) => {
  enabled = enabled !== false;
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
            setShow(!show);
            if (labelProps.onPress) labelProps.onPress(e);
          }}
        >
          <Text
            style={[styles.text, enabled ? null : styles.disabledText]}
          >
            {value ? moment(value).format(mode === 'time' ? 'LT' : 'LL') : placeholder}
          </Text>
          <Icon style={[enabled ? null : { color: '#ccc' }]} name="arrow-dropdown" />
        </Item>
      </Form>

      {(enabled !== false) && show && (
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
};

export default DatePicker;
