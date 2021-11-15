import React from 'react';
import { View, ScrollView } from 'react-native';
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
import { SingleSelect } from './SingleSelect';
import { Fab } from './Fab';
import { useScriptContext } from '../Context';
import { Entry, ScreenComponentProps } from '../types';

export * from './Info';

export function Screen() {
    const theme = useTheme();
    const { 
        activeScreen, 
        activeScreenEntry,
        refresh, 
        setEntry ,
        removeEntry,
        screensWithNoAutoFill,
        onNext
    } = useScriptContext();

    if (refresh) return null;
    
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
                    let Component: React.ComponentType<ScreenComponentProps> = null;
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
                            <Component 
                                canAutoFill={!screensWithNoAutoFill[activeScreen.id]}
                                setEntry={(entry: Entry) => {
                                    const { label, dataType } = (activeScreen.data.metadata || {});
                                    if (!entry) return removeEntry(activeScreen.id);
                                    setEntry({
                                        screen: {
                                            title: activeScreen.data.title,
                                            sectionTitle: activeScreen.data.sectionTitle,
                                            id: activeScreen.id,
                                            screen_id: activeScreen.screen_id,
                                            type: activeScreen.type,
                                            metadata: { label, dataType },
                                        },
                                        ...entry,
                                    });
                                }}
                            />
                        </Content>
                    );
                })()}
            </ScrollView>

            {!!activeScreenEntry && <Fab onPress={() => onNext()} />}
        </>
    );
};
