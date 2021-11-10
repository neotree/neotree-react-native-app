import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, View, Text } from '@/components/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import * as copy from '@/constants/copy/script';
import { useScriptContext } from '../../../Context';
import { ScreenFormFieldComponentProps } from '../../../types';
import { MaterialIcons } from '@expo/vector-icons';

export function Time({ field }: ScreenFormFieldComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const [showPicker, setShowPicker] = React.useState(false);
    const [date, setDate] = React.useState(null);

    return (
        <>
            <Text color={'textPrimary'}>{field.label}</Text>
            <View variant="outlined">
                <TouchableOpacity
                    style={{ 
                        padding: theme.spacing(), 
                        alignItems: 'center', 
                        flexDirection: 'row', 
                    }}
                    onPress={() => setShowPicker(true)}
                >
                    <Text
                        numberOfLines={1}
                        style={{ flex: 1, marginRight: theme.spacing() }}
                        color={'disabled'}
                    >{date ? moment(date).format('HH:MM') : copy.SELECT_DATE_AND_TIME}</Text>
                    
                    <MaterialIcons
                        name="calendar-today"
                        size={20}
                        color={theme.palette.text.secondary}
                    />
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker 
                    testID="dateTimePicker"
                    value={date || new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, selectedDate) => {
                        setDate(selectedDate);
                        setShowPicker(false);
                    }}
                />
            )}
        </>
    );
}
