import React from 'react';
import { Text, Br, View, useTheme, Content } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { BackHandler, Platform, TouchableOpacity } from 'react-native';
import { OverlayLoader } from '@/components/OverlayLoader';
import { RootStackScreenProps } from '@/types';
import * as copy from '@/constants/copy/script';
import { ScriptContext } from './Context';
import { Screen, ScreenInfo } from './Screen';
import { useScriptLogic } from './useScriptLogic';
import { SetNavigationOptions, ScreenOptions } from './types';

export function ScriptScreen({ navigation, route }: RootStackScreenProps<'Script'>) {
    const theme = useTheme();
    const { params: { script_id, screen_id }, } = route;
    const [screenOptions, setScreenOptions] = React.useState<ScreenOptions>(null);
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
        shouldExit,
    } = contextValue;

    function setNavigationOptions(options: SetNavigationOptions = {}, screen = activeScreen) {
        const { customTitle, customSubtitle, onBack: _onBack } = options;
        if (screen) {
            navigation.setOptions({
                headerRight: () => <ScreenInfo screen={screen} />,
                headerLeft: ({ tintColor }) => {
                    return (
                        <TouchableOpacity
                            style={{ marginRight: theme.spacing(2), }}
                            onPress={() => (screenOptions?.onBack || _onBack || onBack)()}
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
                        >{customTitle || screen.data.title}</Text>
                        <Text 
                            variant="caption" 
                            color="textSecondary"
                            numberOfLines={1}
                        >{customSubtitle || script.data.title}</Text>
                    </View>
                ),
                ...options,
                gestureEnabled: true,
                headerBackVisible: false,
            });
        }
    }
    
    React.useEffect(() => {
        if (activeScreen) {
            navigateToScreen(activeScreen.id);
            setNavigationOptions();
        }
    }, [activeScreen, script_id]);

    React.useEffect(() => {
        let backHandler = null;
        if (Platform.OS === 'android') {
          backHandler = BackHandler.addEventListener('hardwareBackPress', screenOptions?.onBack || onBack);
        }
        return () => { if (backHandler) backHandler.remove(); };
    }, [navigation, activeScreen, shouldExit, screenOptions]);

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
            value={{
                ...contextValue,
                setNavigationOptions,
                screenOptions,
                setScreenOptions,
            }}
        >
            {!!activeScreen && <Screen />}
        </ScriptContext.Provider>
    );
};
