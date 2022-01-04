import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { MaterialIcons } from '@expo/vector-icons';

export default function DateInput({ 
    mode, 
    label, 
    onChange,
    value, 
    disabled,
    valueText,
    maxDate,
    minDate,
    placeholder,
}) {
    mode = mode || 'date';
    label = label || '';

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

    const renderValue = () => {
        if (valueText) return valueText;
        if (date) {
            switch(mode) {
                case 'time':
                    return moment(date).format('HH:MM');
                case 'date':
                    return moment(date).format('ll');
                case 'datetime':
                    return moment(date).format('ll HH:mm');
                default:
                    return null;
            }
        }
        return null;
    };

    return (
        <>
            <View 
                style={[
                    { borderWidth: 1, borderColor: '#ddd', },
                    !disabled ? {} : {
                        backgroundColor: '#ddd',
                    },
                ]}
            >
                <TouchableOpacity
                    disabled={disabled}
                    style={{ 
                        padding: 10, 
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
                        style={{ flex: 1, marginRight: 10, color: disabled ? '#999' : '#000' }}
                    >{date ? renderValue() : placeholder || label}</Text>
                    
                    <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color={disabled ? '#999' : '#000'}
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
                    maximumDate={!maxDate ? null : maxDate === 'date_now' ? new Date() : new Date(maxDate)}
                    minimumDate={!minDate ? null : minDate === 'date_now' ? new Date() : new Date(minDate)}
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

DateInput.propTypes = {
    disabled: PropTypes.bool,
    mode: PropTypes.oneOf(['date', 'time', 'datetime']),
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    onChange: PropTypes.func,
    label: PropTypes.string,
    valueText: PropTypes.string,
    maxDate: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf(['date_now'])]),
    minDate: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf(['date_now'])]),
};
