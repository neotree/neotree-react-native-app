import React from 'react';
import { Text, Button, Br, View, useTheme, Content } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { OverlayLoader } from '@/components/OverlayLoader';
import { RootStackScreenProps } from '@/types';
import * as copy from '@/constants/copy/script';
import { ScriptContext } from './Context';
import { Screen, ScreenInfo } from './Screen';
import { useScriptLogic } from './useScriptLogic';

export function ScriptScreen({ navigation, route }: RootStackScreenProps<'Script'>) {
    const theme = useTheme();
    const { params: { script_id, screen_id }, } = route;
    const contextValue = useScriptLogic();
    const { 
        loadScreensError, 
        loadScriptError, 
        ready, 
        screens, 
        script, 
        activeScreen,
        loadData, 
        navigateToScreen,
        onBack,
    } = contextValue;
    
    React.useEffect(() => {
        if (activeScreen) {
            navigateToScreen(activeScreen.id);
            navigation.setOptions({
                headerBackVisible: false,
                headerRight: () => <ScreenInfo screen={activeScreen} />,
                headerLeft: ({ tintColor }) => {
                    return (
                        <TouchableOpacity
                            style={{ marginRight: theme.spacing(2), }}
                            onPress={() => onBack()}
                        >
                            <MaterialIcons 
                                name="arrow-back"
                                color={tintColor}
                                size={20}
                            />
                        </TouchableOpacity>
                    );
                },
                headerTitle: () => (
                    <View>
                        <Text 
                            variant="h6" 
                            color="primary"
                            numberOfLines={1}
                        >{activeScreen.data.title}</Text>
                        <Text 
                            variant="caption" 
                            color="textSecondary"
                            numberOfLines={1}
                        >{script.data.title}</Text>
                    </View>
                ),
            });
        }
    }, [activeScreen, script_id]);

    if (!ready) return <OverlayLoader />;

    if (loadScreensError || loadScriptError || !screens.length) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Content>
                    {!!loadScriptError && (
                        <>
                            <Text style={{ textAlign: 'center' }} color="error">{`${copy.LOAD_SCRIPT_ERR}: ${loadScriptError}`}</Text>
                            <Br />
                        </>
                    )}

                    {!!loadScreensError && (
                        <>
                            <Text style={{ textAlign: 'center' }} color="error">{`${copy.LOAD_SCREENS_ERR}: ${loadScreensError}`}</Text>
                            <Br />
                        </>
                    )}

                    {!script && (
                        <>
                            <Text style={{ textAlign: 'center' }} color="error">{`${copy.SCRIPT_NOT_FOUND}`}</Text>
                            <Br />
                        </>
                    )}

                    {script && !screens.length && (
                        <>
                            <Text style={{ textAlign: 'center' }} color="error">{`(${script.data.title}) ${copy.NO_SCREENS}`}</Text>
                            <Br />
                        </>
                    )}

                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => loadData().then(() => {}).catch(() => {})}
                    >
                        <MaterialIcons size={50} name="refresh" color={theme.palette.action.disabled} />
                    </TouchableOpacity>
                </Content>
            </View>
        )
    }

    return (
        <ScriptContext.Provider
            value={contextValue}
        >
            {!!activeScreen && <Screen />}
        </ScriptContext.Provider>
    );
};
