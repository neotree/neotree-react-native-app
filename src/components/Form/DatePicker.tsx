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
    onChange?: (value: null | Date) => void;
    disabled?: boolean;
    mode: 'date' | 'time' | 'datetime';
    maxDate?: Date | 'date_now';
    minDate?: Date | 'date_now';
};

type RenderReactNodeOptions = { 
    textVariant?: keyof Theme['textVariants']; 
    fontWeight?: any;
    textColor?: any;
};

const renderReactNode = (node: React.ReactNode, opts?: RenderReactNodeOptions) => (
    (typeof node === 'string') || (typeof node === 'number') ? (
        <Text 
            variant={opts?.textVariant} 
            fontWeight={opts?.fontWeight}
            color={opts?.textColor}
        >{node}</Text>
      ) : node
);

export function DatePicker({
    placeholder,
    label,
    value,
    onChange,
    disabled,
    mode,
    maxDate,
    minDate,
    valueText,
}: DatePickerProps) {
    const theme = useTheme();

    const [currentDate] = React.useState(new Date());
    const [date, setDate] = React.useState<null | Date>(value || null);

    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);

    const renderValue = React.useCallback(() => {
        if (valueText !== undefined) return valueText;
        if (value) {
            switch(mode) {
                case 'time':
                    return moments(value).format('HH:MM');
                case 'date':
                    return moments(value).format('ll');
                case 'datetime':
                    return moments(value).format('ll HH:mm');
                default:
                    return null;
            }
        }
        return null;
    }, [value, valueText]);

    React.useEffect(() => {
        if (onChange) onChange(date);
    }, [date]);

    React.useEffect(() => {
        setDate(date => {
            let _value = value ? value.toString() : value;
            let _date = date ? date.toString() : date;
            if (value && (_value !== _date)) return value;
            return date;
        });
    }, [value]);

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
                    if (mode === 'time') {
                        setShowTimePicker(true);
                    } else {
                        setShowDatePicker(true);
                    }
                }}
            >
                <Box
                    borderColor="divider"
                    borderWidth={1}
                    borderRadius="m"
                    padding="m"
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor={disabled ? 'disabledBackground' : undefined}
                >
                    <Box flex={1}>
                        {date ? (
                            <Text color={disabled ? 'textDisabled' : undefined}>
                                {renderValue()}
                            </Text>
                        ) : renderReactNode(placeholder, { textColor: 'textDisabled', })}
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
                    // testID="dateTimePicker"
                    value={date || currentDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    maximumDate={!maxDate ? undefined : (maxDate === 'date_now' ? new Date() : new Date(maxDate))}
                    minimumDate={!minDate ? undefined : (minDate === 'date_now' ? new Date() : new Date(minDate))}
                    onChange={(e, selectedDate) => {
                        if (!selectedDate) return setShowDatePicker(false);
                        setShowDatePicker(false);
                        // setTimeout(() => setDate(selectedDate), 0);
                        setDate(selectedDate);
                        if (mode === 'datetime') {
                            setShowTimePicker(true);
                        }
                    }}
                />
            )}

            {showTimePicker && (
                <DateTimePicker 
                    // testID="dateTimePicker"
                    value={date || currentDate}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedDate) => {
                        if (!selectedDate) return setShowTimePicker(false);
                        setShowTimePicker(false);
                        // setTimeout(() => setDate(selectedDate), 0);
                        setDate(selectedDate);
                    }}
                />
            )}
        </>
    );
}

DatePicker.defaultProps = {
    mode: 'date',
};
