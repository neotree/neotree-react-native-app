import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, View, Text } from '@/components/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenComponentProps } from '../../../types';
import { MaterialIcons } from '@expo/vector-icons';

export function DateTime(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);
    const [date, setDate] = React.useState(null);

    return (
        <>
            <View variant="outlined">
                <TouchableOpacity
                    style={{ 
                        padding: theme.spacing(), 
                        alignItems: 'center', 
                        flexDirection: 'row', 
                    }}
                    onPress={() => {
                        setShowDatePicker(true);
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{ flex: 1, marginRight: theme.spacing() }}
                    >{date ? moment(date).format('LLL') : copy.SELECT_DATE_AND_TIME}</Text>
                    
                    <MaterialIcons
                        name="calendar-today"
                        size={20}
                    />
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker 
                    testID="dateTimePicker"
                    value={date || new Date()}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedDate) => {
                        if (!selectedDate) return setShowDatePicker(false);
                        setDate(selectedDate);
                        setShowTimePicker(true);
                        setShowDatePicker(false);
                    }}
                />
            )}

            {showTimePicker && (
                <DateTimePicker 
                    testID="dateTimePicker"
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
