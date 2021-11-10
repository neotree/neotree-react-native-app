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
import { SingleSelect } from './SingleSelect';

export * from './Info';

export function Screen() {
    const theme = useTheme();
    const { activeScreen, getScreen, navigateToScreen } = useScriptContext();
    
    return (
        <>
            {activeScreen.data.actionText && (
                <View style={{ backgroundColor: theme.palette.info.main }}>
                    <Content style={{ flexDirection: 'row' }}>
                        <Text style={{ color: theme.palette.info.contrastText, flex: 1, alignItems: 'center' }}>{activeScreen.data.actionText}</Text>
                        {!!activeScreen.data.step && (
                            <Text variant="caption" style={{ color: theme.palette.info.contrastText }}>
                                {activeScreen.data.step.replace(/^\s+|\s+$/g, '')}
                            </Text>
                        )}
                    </Content>
                </View>
                
            )}
            <Text>{`${activeScreen.id} - ${activeScreen.data.type}`}</Text>

            <ScrollView>
                {!!activeScreen.data.contentText && (
                    <View style={{ backgroundColor: 'rgba(255, 255, 0,.2)' }}>
                        <Content>
                            <Text color="info">
                                {activeScreen.data.contentText.replace(/^\s+|\s+$/g, '')}
                            </Text>
                        </Content>

                        <Br />
                    </View>
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
                        case screenTypes.SINGLE_SELECT:
                            Component = SingleSelect;
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
                    const res = getScreen('next');
                    if (res?.screen) navigateToScreen(res.screen.id);
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
