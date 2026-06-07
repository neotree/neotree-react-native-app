import React, { useCallback, useMemo, useEffect, useState } from 'react';
import moment from 'moment';
import { Box, DatePicker } from '../../../../components';
import * as types from '../../../../types';
import { toLocalISOString } from '../../../../utils/toLocalISOString';

type DateFieldProps = types.ScreenFormTypeProps & {

};

type DateFieldType = 'date' | 'datetime';
type DefaultValueType = 'date_now' | 'date_noon' | 'date_midnight';

const normalizeDateBoundary = (
  date: Date,
  boundary: 'min' | 'max',
  currentFieldType?: string,
  relatedFieldType?: string
): Date => {
  const normalized = new Date(date);
  const compareByDay = currentFieldType === 'date' || relatedFieldType === 'date';

  if (compareByDay) {
    if (boundary === 'min') {
      normalized.setHours(0, 0, 0, 0);
    } else {
      normalized.setHours(23, 59, 59, 999);
    }
  }

  return normalized;
};

// Helper: Parse date string to Date object, handling both formats
const parseToDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  
  try {
    // Handle shortened format like "2025-12-03 10:12"
    if (typeof value === 'string') {
      // If it's missing seconds, add them
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
        value = `${value}:00`;
      }
      // If it's just a date, add time
      else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value = `${value}T00:00:00`;
      }
      // If it has space instead of T, replace it
      value = value.replace(' ', 'T');
    }
    
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

// Helper: Format date based on field type (for display only)
const formatDate = (date: Date, type: DateFieldType): string => {
  const format = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
  return moment(date).format(format);
};

// Helper: Create default date based on type
const createDefaultDate = (defaultValueType: DefaultValueType): Date => {
  const now = new Date();
  switch (defaultValueType) {
    case 'date_now':
      return now;
    case 'date_noon':
      return moment(now).startOf('day').hour(12).minute(0).toDate();
    case 'date_midnight':
      return moment(now).startOf('day').hour(0).minute(0).toDate();
    default:
      return now;
  }
};

export function DateField({
  field,
  conditionMet,
  entryValue,
  allValues,
  onChange,
  repeatable,
  editable,
  formIndex
}: DateFieldProps) {
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState<Date | null>(() => parseToDate(entryValue?.value));
  
  const canEdit = repeatable ? editable : true;
  const fieldKey = field?.key;
  const fieldLabel = field?.label;

  // Helper: Log events
  const logDateFieldEvent = useCallback(
    (event: string, payload: Record<string, unknown> = {}) => {
      const prefix = repeatable ? '[Repeatable][DateField]' : '[NonRepeatable][DateField]';
      console.log(prefix, event, {
        isRepeatable: !!repeatable,
        fieldKey,
        fieldLabel,
        formIndex,
        ...payload,
      });
    },
    [fieldKey, fieldLabel, formIndex, repeatable]
  );

  // Calculate min/max dates from related fields
  const { minDate, maxDate } = useMemo(() => {
    let minDate: Date | undefined = undefined;
    let maxDate: Date | undefined = undefined;

    if (field.minDateKey && allValues) {
      const minDateKey = field.minDateKey.replace(/^\$/, '');
      const minDateField = allValues.find(
        v => v.key?.toLowerCase() === minDateKey.toLowerCase()
      );
      
      if (minDateField?.value) {
        const _minDate = parseToDate(minDateField.value);
        if (_minDate) {
          minDate = normalizeDateBoundary(_minDate, 'min', field.type, minDateField.type);
        }
      }
    }

    if (field.maxDateKey && allValues) {
      const maxDateKey = field.maxDateKey.replace(/^\$/, '');
      const maxDateField = allValues.find(
        v => v.key?.toLowerCase() === maxDateKey.toLowerCase()
      );
      
      if (maxDateField?.value) {
        const _maxDate = parseToDate(maxDateField.value);
        if (_maxDate) {
          maxDate = normalizeDateBoundary(_maxDate, 'max', field.type, maxDateField.type);
        }
      }
    }

    return { minDate, maxDate };
  }, [field.minDateKey, field.maxDateKey, allValues]);

  // Get validation errors
  const getErrors = useCallback(
    (dateValue: string | null): string[] => {
      const errors: string[] = [];
      
      if (!dateValue) return errors;
      
      const date = parseToDate(dateValue);
      if (!date) return errors;
      
      const dateFormat = field.type === 'date' ? 'LL' : 'LLL';

      if (minDate && date.getTime() < minDate.getTime()) {
        errors.push(
          `Date should be on or after the min date: ${moment(minDate).format(dateFormat)}`
        );
      }

      if (maxDate && date.getTime() > maxDate.getTime()) {
        errors.push(
          `Date should be on or before the max date: ${moment(maxDate).format(dateFormat)}`
        );
      }

      return errors;
    },
    [field.type, minDate, maxDate]
  );

  // Handle condition changes and default values
  useEffect(() => {
    if (!conditionMet) {
      onChange({ value: null, valueText: null, exportType: 'date' });
      setValue(null);
      logDateFieldEvent('conditionReset', { reason: 'conditionMet=false' });
      return;
    }

    // Only apply default values on first mount
    if (!mounted && field.defaultValue) {
      const defaultValueType = field.defaultValue as DefaultValueType;
      const validDefaults: DefaultValueType[] = ['date_now', 'date_noon', 'date_midnight'];
      
      if (validDefaults.includes(defaultValueType)) {
        const date = createDefaultDate(defaultValueType);
        const normalizedValue = toLocalISOString(date);
        const formattedDate = formatDate(date, field.type as DateFieldType);

        logDateFieldEvent('defaultValueApplied', {
          defaultValue: field.defaultValue,
          isoValue: normalizedValue,
          formatted: formattedDate,
        });

        onChange({
          exportType: 'date',
          value: normalizedValue,
          valueText: formattedDate,
          valueLabel: formattedDate,
          exportValue: formattedDate,
          exportLabel: formattedDate,
          label: field.label,
        });
        
        setValue(date);
      }
    }
  }, [
    conditionMet,
    mounted,
    field.defaultValue,
    field.type,
    field.label,
    onChange,
    logDateFieldEvent,
  ]);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with external entry value changes
  useEffect(() => {
    if (!entryValue) {
      setValue(null);
      logDateFieldEvent('entryValueSynced', {
        entryValue: null,
        entryValueText: null,
        normalizedValue: null,
        note: 'entryValue missing',
      });
      return;
    }

    const nextValue = parseToDate(entryValue.value);
    
    if (entryValue.value && !nextValue) {
      setValue(null);
      logDateFieldEvent('entryValueSynced', {
        entryValue: entryValue.value,
        entryValueText: entryValue.valueText || null,
        normalizedValue: null,
        note: 'invalid date',
      });
      return;
    }

    logDateFieldEvent('entryValueSynced', {
      entryValue: entryValue.value || null,
      entryValueText: entryValue.valueText || null,
      normalizedValue: nextValue ? toLocalISOString(nextValue) : null,
    });
    
    setValue(nextValue);
  }, [entryValue?.value, entryValue?.valueText, logDateFieldEvent]);

  // Handle date changes
  const handleDateChange = useCallback(
    (pickedValue: Date | null) => {
      let date: Date | null = null;
      
      if (pickedValue) {
        const hour = moment(pickedValue).hours();
        const minute = moment(pickedValue).minutes();
        date = moment(pickedValue).startOf('day').add(hour, 'hour').add(minute, 'minute').toDate();
      }

      const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : null;
      const normalizedValue = validDate ? toLocalISOString(validDate) : null;
      const valueText = validDate ? formatDate(validDate, field.type as DateFieldType) : null;
      const error = getErrors(normalizedValue)[0] || null;

      const payload = {
        label: field.label,
        error,
        exportType: 'date' as const,
        value: normalizedValue,
        valueText,
      };

      setValue(validDate);
      
      logDateFieldEvent('onChange', {
        pickedValue: pickedValue ? toLocalISOString(pickedValue) : null,
        normalizedValue,
        valueText,
        error,
      });
      
      onChange(payload);
    },
    [field.label, field.type, getErrors, onChange, logDateFieldEvent]
  );

  return (
    <Box>
      <DatePicker
        errors={getErrors(entryValue?.value || null)}
        mode={field.type === 'date' ? 'date' : 'datetime'}
        value={value}
        valueText={entryValue?.valueText || undefined}
        disabled={!conditionMet || !canEdit}
        label={`${field.label}${field.optional ? '' : ' *'}`}
        fieldKey={field.key}
        onChange={handleDateChange}
        maxDate={maxDate || field.maxDate}
        minDate={minDate || field.minDate}
      />
    </Box>
  );
}