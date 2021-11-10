import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, View, Text } from '@/components/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { MaterialIcons } from '@expo/vector-icons';

export type DatePickerProps = {
    mode?: 'time' | 'date' | 'datetime',
    label?: string;
    onChange?: (value: Date) => void;
    value?: Date;
    disabled?: boolean;
};

export function DatePicker({ 
    mode, 
    label, 
    onChange,
    value, 
    disabled,
}: DatePickerProps) {
    mode = mode || 'date';
    label = label || '';
    const theme = useTheme();

    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const [date, setDate] = React.useState(value);

    React.useEffect(() => {
        if (onChange && !(showDatePicker || showTimePicker)) onChange(date);
    }, [date, showDatePicker, showTimePicker]);

    React.useEffect(() => {
        setDate(date => {
            let _value = value ? value.toString() : value;
            let _date = date ? date.toString() : date;
            if (_value !== _date) return value;
            return date;
        });
    }, [value]);

    return (
        <>
            <View 
                variant="outlined"
                style={[
                    !disabled ? {} : {
                        backgroundColor: theme.palette.action.disabledBackground,
                    },
                ]}
            >
                <TouchableOpacity
                    disabled={disabled}
                    style={{ 
                        padding: theme.spacing(), 
                        alignItems: 'center', 
                        flexDirection: 'row', 
                        height: 50,
                    }}
                    onPress={() => {
                        if (mode === 'time') {
                            setShowTimePicker(true);
                        } else {
                            setShowDatePicker(true);
                        }
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{ flex: 1, marginRight: theme.spacing() }}
                        color={(disabled || !value) ? 'disabled' : 'textPrimary'}
                    >{date ? moment(date).format('LLL') : label}</Text>
                    
                    <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color={disabled ? theme.palette.action.disabled : theme.palette.text.secondary}
                    />
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker 
                    // testID="dateTimePicker"
                    value={date || new Date()}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedDate) => {
                        if (!selectedDate) return setShowDatePicker(false);
                        setDate(selectedDate);
                        setShowDatePicker(false);
                        if (mode === 'datetime') {
                            setShowTimePicker(true);
                        }
                    }}
                />
            )}

            {showTimePicker && (
                <DateTimePicker 
                    // testID="dateTimePicker"
                    value={date || new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedDate) => {
                        if (!selectedDate) return setShowTimePicker(false);
                        setDate(selectedDate);
                        setShowTimePicker(false);
                    }}
                />
            )}
        </>
    );
}
