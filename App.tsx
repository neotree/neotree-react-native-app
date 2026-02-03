import 'react-native-gesture-handler';
import * as React from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from 'react-native-error-boundary'
import Icon from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';

import {CustomError}from './src/types'
import {handleAppCrush} from './src/utils/handleCrashes'
import { getUpdatePolicyData } from './src/data/queries';
import { reportAppStateIfChanged } from './src/data/appState';
import { attemptAutoInstallIfDeferred, attemptAutoRetryDownload, flushOtaEvents, getDownloadState, installApkIfSafe } from './src/update';
import { ApkUpdateBanner, Modal, Text as UIText } from './src/components';
import { useAppContext } from './src/AppContext';

import { 
    assets as srcAssets,
	Navigation,
	ThemeProvider, 
	LoadAssets, 
	LoadAssetsProps,
    AppContextProvider 
} from './src';

const assets: LoadAssetsProps['assets'] = [
    ...srcAssets,
];

const fonts: LoadAssetsProps['fonts'] = {
    ...Icon.font,
};

export default function App() {
    const [showRuntimeWarning, setShowRuntimeWarning] = React.useState(false);

    const checkRuntimeMismatch = React.useCallback(async () => {
        try {
            const policy = await getUpdatePolicyData();
            const policyRuntime = policy?.runtimeVersion;
            const runtimeVersion = (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion;
            if (policyRuntime && runtimeVersion && `${policyRuntime}` !== `${runtimeVersion}`) {
                setShowRuntimeWarning(true);
            } else {
                setShowRuntimeWarning(false);
            }
        } catch {
            // offline-first: no banner if we can't read policy
            setShowRuntimeWarning(false);
        }
    }, []);

    React.useEffect(() => {
        reportAppStateIfChanged();
        checkRuntimeMismatch();
        attemptAutoInstallIfDeferred().catch(() => null);
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                checkRuntimeMismatch();
                flushOtaEvents();
                attemptAutoInstallIfDeferred().catch(() => null);
            }
        });
        return () => sub.remove();
    }, [checkRuntimeMismatch]);

    const errorHandler = (error: Error, stackTrace: string) => {
        const customError = ({message: error.message,stack: stackTrace} as CustomError)   
        handleAppCrush(customError)
    };
      
    return (
        <ErrorBoundary onError={errorHandler}>
        <AppContextProvider>
            <ThemeProvider>
                <LoadAssets {...{ fonts, assets }}>
                    <SafeAreaProvider>
                        {showRuntimeWarning ? (
                            <View style={styles.runtimeBanner}>
                                <Text style={styles.runtimeBannerText}>
                                    A new app update is available. Please contact your administrator.
                                </Text>
                            </View>
                        ) : null}
                        <ApkUpdateBanner />
                        <ForcedInstallModal />
                        <UpdateBackgroundWorker />
                        <Navigation />
            
                    </SafeAreaProvider>
                </LoadAssets>
            </ThemeProvider>
        </AppContextProvider>
        </ErrorBoundary>
    );
}

function ForcedInstallModal() {
    const { updateDecision } = useAppContext() || {};
    const [open, setOpen] = React.useState(false);
    const [downloadState, setDownloadState] = React.useState<any>(null);

    React.useEffect(() => {
        const shouldShow = updateDecision?.state === 'apk_forced';
        setOpen(!!shouldShow);
    }, [updateDecision?.state]);

    React.useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            const s = await getDownloadState();
            if (mounted) setDownloadState(s);
        };
        refresh();
        const id = setInterval(refresh, 2000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    if (!open) return null;

    const canInstall = downloadState?.status === 'verified' && downloadState?.fileUri;
    const forceMessage = updateDecision?.policy?.apk?.messageBody || 'A required update is ready to install.';

    return (
        <Modal
            open={open}
            onClose={() => null}
            title="Update Required"
            actions={[
                {
                    label: 'Install now',
                    color: 'primary',
                    onPress: async () => {
                        if (!canInstall) return;
                        try {
                            await installApkIfSafe(downloadState.fileUri);
                        } catch {
                            // keep modal open
                        }
                    },
                },
            ]}
        >
            <UIText>{forceMessage}</UIText>
            {!canInstall ? (
                <UIText style={{ marginTop: 8 }} color="textSecondary">
                    Downloading update... Please wait.
                </UIText>
            ) : null}
        </Modal>
    );
}

function UpdateBackgroundWorker() {
    const { updateDecision } = useAppContext() || {};

    React.useEffect(() => {
        if (!updateDecision) return;

        let active = true;
        const tick = async () => {
            if (!active) return;
            await attemptAutoRetryDownload(updateDecision).catch(() => null);
            await attemptAutoInstallIfDeferred().catch(() => null);
        };

        tick();
        const id = setInterval(tick, 60000);
        return () => {
            active = false;
            clearInterval(id);
        };
    }, [updateDecision]);

    return null;
}

const styles = StyleSheet.create({
    runtimeBanner: {
        backgroundColor: '#FFF4E5',
        borderBottomColor: '#FFB74D',
        borderBottomWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    runtimeBannerText: {
        color: '#663C00',
        fontSize: 14,
    },
});
