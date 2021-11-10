import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Content, Br, Text } from '@/components/ui';
import { fieldsTypes } from '@/constants/screen';
import { FieldDate } from './Date';
import { DateTime } from './DateTime';
import { DropDown } from './DropDown';
import { FieldText } from './Text';
import { Period } from './Period';
import { Time } from './Time';
import { FieldNumber } from './Number';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps, ScreenFormFieldComponentProps } from '../../types';

export function Form(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();
    const fields = activeScreen.data.metadata?.fields || [];

    return (
        <>
            <ScrollView>
                {fields.map((f, i) => {
                    return (
                        <React.Fragment key={i}>
                            {(() => {
                                let Component: React.ComponentType<ScreenFormFieldComponentProps> = null;
                                switch (f.type) {
                                    case fieldsTypes.DATE:
                                        Component = FieldDate;
                                        break;
                                    case fieldsTypes.DATETIME:
                                        Component = DateTime;
                                        break;
                                    case fieldsTypes.TEXT:
                                        Component = FieldText;
                                        break;
                                    case fieldsTypes.NUMBER:
                                        Component = FieldNumber;
                                        break;
                                    case fieldsTypes.TIME:
                                        Component = Time;
                                        break;
                                    case fieldsTypes.PERIOD:
                                        Component = Period;
                                        break;
                                    case fieldsTypes.DROPDOWN:
                                        Component = DropDown;
                                        break;
                                    default:
                                        break;
                                }
                                return !Component ? null : (
                                    <>
                                        <Br />
                                        <Text color={'textPrimary'}>{f.label}</Text>
                                        <Component {...props} field={f} />
                                    </>
                                );
                            })()}
                        </React.Fragment>
                    );
                })}
            </ScrollView>
        </>
    );
}
