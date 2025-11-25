import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Box, Theme, useTheme } from '../Theme';
import { Br } from '../Br';

export type DatePickerProps = {
  placeholder?: React.ReactNode;
  label?: React.ReactNode;
  value?: null | Date;
  valueText?: string;
  fieldKey?: string;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  maxDate?: Date | 'date_now';
  minDate?: Date | 'date_now';
  errors?: string[];
  onChange?: (value: null | Date) => void;
};

type RenderReactNodeOptions = {
  textVariant?: keyof Theme['textVariants'];
  fontWeight?: any;
  textColor?: any;
};

const renderReactNode = (node: React.ReactNode, opts?: RenderReactNodeOptions) =>
  typeof node === 'string' || typeof node === 'number' ? (
    <Text
      variant={opts?.textVariant}
      fontWeight={opts?.fontWeight}
      color={opts?.textColor}
    >
      {`${node}`}
    </Text>
  ) : (
    node
  );

export function DatePicker({
  placeholder,
  label,
  value,
  disabled,
  mode = 'date',
  fieldKey,
  maxDate,
  minDate,
  valueText,
  errors,
  onChange,
}: DatePickerProps) {
  errors = (errors || []).filter((e) => e);

  const theme = useTheme();

  const [date, setDate] = React.useState<null | Date>(value ?? null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [tempPickerDate, setTempPickerDate] = React.useState<Date>(new Date());

  const reset = React.useCallback(() => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, []);

  const renderValue = React.useCallback(() => {
    if (valueText !== undefined) return valueText;
    if (value) {
      switch (mode) {
        case 'time':
          return moment(value).format('HH:mm');
        case 'date':
          return moment(value).format('ll');
        case 'datetime':
          return moment(value).format('ll HH:mm');
        default:
          return '';
      }
    }
    return '';
  }, [value, valueText, mode]);

  React.useEffect(() => {
    if (onChange) onChange(date);
  }, [date]);

  React.useEffect(() => {
    setDate((date) => {
      let _value = value?.toString?.() || value;
      let _date = date?.toString?.() || date;
      if (value && _value !== _date) return new Date(value);
      if (value === null && date !== null) return null;
      return date;
    });
  }, [value]);

  // --- 28-day restriction for DOBTOB field ---
  const now = new Date();

  const effectiveMaxDate =
    fieldKey === 'DOBTOB'
      ? now
      : !maxDate
      ? undefined
      : maxDate === 'date_now'
      ? now
      : new Date(maxDate);

      //Limit minimum date for DOBTOB to 84 days ago
    const effectiveMinDate =
      fieldKey === 'DOBTOB'
        ? moment(now).subtract(84, 'days').toDate()
        : !minDate
        ? undefined
        : minDate === 'date_now'
        ? now
        : new Date(minDate);

  return (
    <>
      {!!label && (
        <>
          {renderReactNode(label)}
          <Br spacing="s" />
        </>
      )}

      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          if (!date) {
            setTempPickerDate(new Date());
          }

          if (mode === 'time') {
            setShowTimePicker(true);
          } else {
            setShowDatePicker(true);
          }
        }}
      >
        <Box
          borderColor={errors?.length ? 'error' : 'divider'}
          borderWidth={1}
          borderRadius="m"
          padding="m"
          flexDirection="row"
          alignItems="center"
          backgroundColor={disabled ? 'disabledBackground' : undefined}
        >
          <Box flex={1}>
            {valueText !== undefined || date ? (
              <Text color={disabled ? 'textDisabled' : undefined}>
                {renderValue()}
              </Text>
            ) : (
              renderReactNode(placeholder, { textColor: 'textDisabled' })
            )}
          </Box>

          <Box paddingLeft="m">
            <Icon
              size={24}
              color={theme.colors.textDisabled}
              name="calendar-today"
            />
          </Box>
        </Box>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date || tempPickerDate}
          mode="date"
          is24Hour={true}
          display="default"
          maximumDate={effectiveMaxDate}
          minimumDate={effectiveMinDate}
          onChange={(e, selectedDate) => {
            if (!selectedDate || e.type === 'dismissed') {
              return setShowDatePicker(false);
            }
            if (e.type === 'neutralButtonPressed') {
              setDate(null);
              return reset();
            }
            setShowDatePicker(false);

            const hour = date ? moment(date).hours() : 0;
            const minute = date ? moment(date).minutes() : 0;
            const newDate = moment(selectedDate)
              .startOf('day')
              .add(hour, 'hour')
              .add(minute, 'minute')
              .toDate();
            setDate(newDate);

            if (mode === 'datetime') {
              setShowTimePicker(true);
            }
          }}
          neutralButton={{ label: 'Clear', textColor: 'red' }}
          negativeButton={{ label: 'Cancel', textColor: 'black' }}
          positiveButton={{ label: 'Ok', textColor: 'green' }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || tempPickerDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(e, selectedDate) => {
            if (!selectedDate || e.type === 'dismissed') {
              return setShowTimePicker(false);
            }
            if (e.type === 'neutralButtonPressed') {
              setDate(null);
              return reset();
            }
            setShowTimePicker(false);

            const hour = moment(selectedDate).hours();
            const minute = moment(selectedDate).minutes();
            const newDate = date
              ? moment(date)
                  .startOf('day')
                  .add(hour, 'hour')
                  .add(minute, 'minute')
                  .toDate()
              : moment(tempPickerDate)
                  .startOf('day')
                  .add(hour, 'hour')
                  .add(minute, 'minute')
                  .toDate();
            setDate(newDate);
          }}
          neutralButton={{ label: 'Clear', textColor: 'red' }}
          negativeButton={{ label: 'Cancel', textColor: 'black' }}
          positiveButton={{ label: 'Ok', textColor: 'green' }}
        />
      )}

      {!!errors?.length && (
        <Box>
          {errors.map((e, i) => (
            <Text key={i} fontSize={12} color="error" mb="s">
              {`${e}`}
            </Text>
          ))}
        </Box>
      )}
    </>
  );
}
