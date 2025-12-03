import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Helper: Compare dates by value
const datesEqual = (date1: Date | null | undefined, date2: Date | null | undefined): boolean => {
  if (!date1 && !date2) return true;
  if (!date1 || !date2) return false;
  return date1.getTime() === date2.getTime();
};

// Helper: Safely parse date, handling multiple formats
const parseDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  
  try {
    // Handle shortened format like "2025-12-03 10:12"
    if (typeof value === 'string') {
      let processedValue = value;
      
      // If it's missing seconds, add them
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(processedValue)) {
        processedValue = `${processedValue}:00`;
      }
      // If it's just a date, add time
      else if (/^\d{4}-\d{2}-\d{2}$/.test(processedValue)) {
        processedValue = `${processedValue}T00:00:00`;
      }
      // If it has space instead of T, replace it
      processedValue = processedValue.replace(' ', 'T');
      
      const parsed = new Date(processedValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

// Helper: Combine date and time
const combineDateAndTime = (date: Date | null, hour: number, minute: number): Date => {
  const baseDate = date || new Date();
  return moment(baseDate)
    .startOf('day')
    .add(hour, 'hour')
    .add(minute, 'minute')
    .toDate();
};

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
  errors: errorsProp,
  onChange,
}: DatePickerProps) {
  const theme = useTheme();
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  const [date, setDate] = useState<Date | null>(() => parseDate(value));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Filter valid errors
  const errors = useMemo(() => {
    return (errorsProp || []).filter((e): e is string => Boolean(e));
  }, [errorsProp]);

  // Close all pickers
  const closeAllPickers = useCallback(() => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, []);

  // Format date for display
  const renderValue = useCallback((): string => {
    if (valueText !== undefined) return valueText;
    if (!value) return '';

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
  }, [value, valueText, mode]);

  // Calculate effective min/max dates with special handling for DOBTOB
  const { effectiveMinDate, effectiveMaxDate } = useMemo(() => {
    const now = new Date();

    // Special handling for DOBTOB field
    if (fieldKey === 'DOBTOB') {
      return {
        effectiveMaxDate: now,
        effectiveMinDate: moment(now).subtract(170, 'days').toDate(),
      };
    }

    // Standard date range handling
    const effectiveMaxDate = !maxDate
      ? undefined
      : maxDate === 'date_now'
      ? now
      : new Date(maxDate);

    const effectiveMinDate = !minDate
      ? undefined
      : minDate === 'date_now'
      ? now
      : new Date(minDate);

    return { effectiveMinDate, effectiveMaxDate };
  }, [fieldKey, maxDate, minDate]);

  // Sync internal date state with external value prop
  useEffect(() => {
    // Skip if this is from our own onChange call
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    const parsedValue = parseDate(value);
    
    // Only update if values actually differ
    if (!datesEqual(parsedValue, date)) {
      setDate(parsedValue);
    }
  }, [value]);

  // Handle internal date changes
  const handleInternalDateChange = useCallback((newDate: Date | null) => {
    setDate(newDate);
    
    // Mark this as an internal change
    isInternalChange.current = true;
    
    // Notify parent
    if (onChangeRef.current) {
      onChangeRef.current(newDate);
    }
  }, []);

  // Handle date selection
  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (!selectedDate || event.type === 'dismissed') {
        setShowDatePicker(false);
        return;
      }

      if (event.type === 'neutralButtonPressed') {
        handleInternalDateChange(null);
        closeAllPickers();
        return;
      }

      setShowDatePicker(false);

      // Preserve existing time if we have a date
      const hour = date ? moment(date).hours() : 0;
      const minute = date ? moment(date).minutes() : 0;
      const newDate = combineDateAndTime(selectedDate, hour, minute);
      
      handleInternalDateChange(newDate);

      // For datetime mode, show time picker next
      if (mode === 'datetime') {
        setShowTimePicker(true);
      }
    },
    [date, mode, closeAllPickers, handleInternalDateChange]
  );

  // Handle time selection
  const handleTimeChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (!selectedDate || event.type === 'dismissed') {
        setShowTimePicker(false);
        return;
      }

      if (event.type === 'neutralButtonPressed') {
        handleInternalDateChange(null);
        closeAllPickers();
        return;
      }

      setShowTimePicker(false);

      const hour = moment(selectedDate).hours();
      const minute = moment(selectedDate).minutes();
      const newDate = combineDateAndTime(date, hour, minute);
      
      handleInternalDateChange(newDate);
    },
    [date, closeAllPickers, handleInternalDateChange]
  );

  // Open appropriate picker
  const openPicker = useCallback(() => {
    if (mode === 'time') {
      setShowTimePicker(true);
    } else {
      setShowDatePicker(true);
    }
  }, [mode]);

  // Get current picker value (use current date or fallback to now)
  const pickerValue = useMemo(() => date || new Date(), [date]);

  return (
    <>
      {!!label && (
        <>
          {renderReactNode(label)}
          <Br spacing="s" />
        </>
      )}

      <TouchableOpacity disabled={disabled} onPress={openPicker}>
        <Box
          borderColor={errors.length ? 'error' : 'divider'}
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
          value={pickerValue}
          mode="date"
          is24Hour={true}
          display="default"
          maximumDate={effectiveMaxDate}
          minimumDate={effectiveMinDate}
          onChange={handleDateChange}
          neutralButton={{ label: 'Clear', textColor: 'red' }}
          negativeButton={{ label: 'Cancel', textColor: 'black' }}
          positiveButton={{ label: 'Ok', textColor: 'green' }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
          neutralButton={{ label: 'Clear', textColor: 'red' }}
          negativeButton={{ label: 'Cancel', textColor: 'black' }}
          positiveButton={{ label: 'Ok', textColor: 'green' }}
        />
      )}

      {errors.length > 0 && (
        <Box>
          {errors.map((error, index) => (
            <Text key={index} fontSize={12} color="error" mb="s">
              {error}
            </Text>
          ))}
        </Box>
      )}
    </>
  );
}