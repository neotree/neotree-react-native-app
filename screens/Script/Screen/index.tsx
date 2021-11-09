import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Content, Br, Text } from '@/components/ui';
import { screenTypes } from '@/constants/screen';
import { Checklist } from './Checklist';
import { Diagnosis } from './Diagnosis';
import { Form } from './Form';
import { List } from './List';
import { Management } from './Management';
import { MultiSelect } from './MultiSelect';
import { Progress } from './Progress';
import { Timer } from './Timer';
import { YesNo } from './YesNo';
import { useScriptContext } from '../Context';
import { MaterialIcons } from '@expo/vector-icons';

export function Screen() {
    const theme = useTheme();
    const { activeScreen, getScreen, navigateToScreen } = useScriptContext();
    
    return (
        <>
            {activeScreen.data.actionText && (
                <View style={{ backgroundColor: theme.palette.info.main }}>
                    <Content>
                        <Text style={{ color: theme.palette.info.contrastText }}>{activeScreen.data.actionText}</Text>
                    </Content>
                </View>
            )}
            <Text>{activeScreen.data.type}</Text>

            <ScrollView>
                {!!activeScreen.data.contentText && (
                    <>
                        <Content
                            style={{ justifyContent: 'center', backgroundColor: 'rgba(255, 255, 0,.2)' }}
                        >
                            <Text color="info">
                                {activeScreen.data.contentText.replace(/^\s+|\s+$/g, '')}
                            </Text>
                        </Content>

                        <Br />
                    </>
                )}

                {(() => {
                    let Component = null;
                    switch (activeScreen.type) {
                        case screenTypes.CHECKLIST:
                            Component = Checklist;
                            break;
                        case screenTypes.DIAGNOSIS:
                            Component = Diagnosis;
                            break;
                        case screenTypes.FORM:
                            Component = Form;
                            break;
                        case screenTypes.LIST:
                            Component = List;
                            break;
                        case screenTypes.MANAGEMENT:
                            Component = Management;
                            break;
                        case screenTypes.MULTI_SELECT:
                            Component = MultiSelect;
                            break;
                        case screenTypes.PROGRESS:
                            Component = Progress;
                            break;
                        case screenTypes.TIMER:
                            Component = Timer;
                            break;
                        case screenTypes.YESNO:
                            Component = YesNo;
                            break;
                        default:
                            break;
                    }
                    return !Component ? null : (
                        <Content>
                            <Component />
                        </Content>
                    );
                })()}
            </ScrollView>

            <TouchableOpacity
                style={{
                    backgroundColor: theme.palette.primary.main,
                    width: 50,
                    height: 50,
                    borderRadius: 30,
                    position: 'absolute',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onPress={() => {
                    const s = getScreen('next');
                    navigateToScreen(s.id);
                }}
            >
                <MaterialIcons 
                    color={theme.palette.primary.contrastText}
                    size={30}
                    name="arrow-forward"
                />
            </TouchableOpacity>
        </>
    );
};
