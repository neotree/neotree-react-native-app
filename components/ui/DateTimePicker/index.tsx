import React from 'react';
import { View, TouchableOpacity, Modal, TouchableOpacityProps, StyleSheet } from 'react-native';
import { Paper } from '../Paper'
import { Text } from '../Text';
import { Button } from '../Button';
import { Br } from '../Br';
import { useTheme  } from '../theme';
import { Icon } from '../Icon';

export type DateTimePickerProps = {

};

const weekDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type BlockProps = TouchableOpacityProps & {
    label: string;
    title?: boolean;
    selected?: boolean;
};

const Block = ({
    label,
    style,
    title,
    selected,
    ...props
}: BlockProps) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            {...props}
            disabled={title}
            style={[
                { 
                    width: `${100 / 7}%`,
                    padding: theme.spacing(),
                    alignItems: 'center',   
                    backgroundColor: selected ? theme.palette.secondary.main : undefined, 
                    borderColor: selected ? theme.palette.secondary.main : undefined                  
                },
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
        >
            <Text
                style={[
                    { color: selected ? theme.palette.secondary.contrastText : undefined },
                    !title ? null : { fontWeight: 'bold' }
                ]}
            >{label}</Text>
        </TouchableOpacity>
    );
};

export const DateTimePicker = React.forwardRef((props: DateTimePickerProps, ref) => {
    const dtPickerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => dtPickerRef.current);
    const theme = useTheme();

    const [today] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(today);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const date = selectedDate.getDate() + 1;
    const day = selectedDate.getDay() + 1;

    const cells = (() => {
        function daysInMonth(iMonth, iYear) {
            return 32 - new Date(iYear, iMonth, 32).getDate();
        }

        const firstDay = (new Date(year, month)).getDay();
        let date = 1;
        const rows = [];
        for ( var i = 0; i < 6; i++ ) {
            const row = [];
            for ( var j = 0; j < 7; j++ ) {
                if ( i === 0 && j < firstDay ) {
                    row.push('');
                } else if (date > daysInMonth(month, year)) {
                    break;
                } else {
                    row.push(date);
                    date++;
                }

            }
            rows.push(
                <View
                    key={`week${i}`}
                    style={[
                        styles.row,
                        { borderColor: i < 5 ? theme.palette.action.disabled : 'transparent', },
                    ]}
                >
                    {row.map((date, index) => {
                        const selected = date === today.getDate() && year === today.getFullYear() && (month - 1) === today.getMonth();
                        return (
                            <Block 
                                key={`${index}`}
                                label={`${date}`}
                                selected={selected}
                                style={[
                                    { 
                                        borderRightWidth: 1,
                                        borderColor: index < 6 ? theme.palette.action.disabled : 'transparent', 
                                    },
                                ]}
                            />
                        )
                    })}
                </View>
            );
        }
        return rows;
    })();

    return (
        <>
            <Modal
                visible
                transparent={false}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,.4)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{ width: '90%', maxWidth: 450 }}
                    >
                        <Paper>
                            <Br />

                            <View style={{ alignItems: 'center' }}>
                                <Text variant="h3">{`${[months[month - 1]]} ${year}`}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', padding: theme.spacing(), }}>
                                <Button
                                    fullWidth={false} 
                                    color="primary" 
                                    variant="contained" 
                                    disableElevation
                                    onPress={() => setSelectedDate(prev => {
                                        let month = prev.getMonth() - 1;
                                        let year = prev.getFullYear();
                                        if (month < 0) {
                                            month = 11;
                                            year = year - 1;
                                        }
                                        const newDate = new Date(prev);
                                        newDate.setMonth(month);
                                        newDate.setFullYear(year);
                                        return newDate;
                                    })}
                                >
                                    <Icon name="keyboard-arrow-left" />
                                </Button>

                                <View style={{ flex: 1 }} />

                                <Button 
                                    fullWidth={false} 
                                    color="primary" 
                                    variant="contained" 
                                    disableElevation
                                    onPress={() => setSelectedDate(prev => {
                                        let month = prev.getMonth() + 1;
                                        let year = prev.getFullYear();
                                        if (month > 11) {
                                            month = 0;
                                            year = year + 1;
                                        }
                                        const newDate = new Date(prev);
                                        newDate.setMonth(month);
                                        newDate.setFullYear(year);
                                        return newDate;
                                    })}
                                >
                                    <Icon name="keyboard-arrow-right" />
                                </Button>
                            </View>

                            <View
                                style={[
                                    styles.row,
                                    { 
                                        borderTopWidth: 1,
                                        borderColor: theme.palette.action.disabled 
                                    },
                                ]}
                            >
                                {weekDays.map((day, index) => {
                                    return (
                                        <Block 
                                            key={day}
                                            label={day}
                                            title
                                            style={[
                                                { 
                                                    borderRightWidth: 1,
                                                    borderColor: index < 6 ? theme.palette.action.disabled : 'transparent', 
                                                },
                                            ]}
                                        />
                                    )
                                })}
                            </View>

                            {cells}
                        </Paper>
                    </View>
                </View>
            </Modal>
        </>
    );
});


const styles = StyleSheet.create({
    row: {
        borderBottomWidth: 1,
       flexDirection: 'row',
    }
});
