import React from 'react';
import { Modal, TouchableOpacity, Platform, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, FormAndDiagnosesSummary, Header, PrintSession, useTheme,PrintBarCode,Text, Button} from '../../components';
import * as types from '../../types';
import { logFatal } from '@/src/utils/logError';

/**
 * Scoped to just this modal: the app's only other ErrorBoundary is the one
 * top-level instance in App.tsx, so without this, a render fault caused by a
 * single malformed session (e.g. a form entry missing screen metadata) would
 * otherwise unmount the entire app rather than just failing to show this one
 * record.
 */
function SessionErrorFallback({ onClose }: { onClose: () => void }) {
    return (
        <Box flex={1} alignItems="center" justifyContent="center" padding="l">
            <Text variant="title3" color="primary" style={{ textAlign: 'center', marginBottom: 12 }}>
                This record couldn't be displayed
            </Text>
            <Text color="textSecondary" style={{ textAlign: 'center', marginBottom: 20 }}>
                Its data may be incomplete or in an unexpected format. This has been reported automatically.
            </Text>
            <Button color="primary" onPress={onClose}>Close</Button>
        </Box>
    );
}

export type SessionProps = {
    session: any;
    navigation: NativeStackNavigationProp<types.HomeRoutes, "Sessions", undefined>;
    onBack: () => void;
};


export function Session({ session, onBack }: SessionProps) {
    const theme = useTheme();
    const [showConfidential, setShowConfidential] = React.useState(false);

    const onClose = () => {
        onBack();
    };

    return (
        <Modal
            visible
            transparent={true}
            statusBarTranslucent
            animationType="slide"
            onRequestClose={() => onClose()}
        >
            <Box flex={1} style={{ backgroundColor: '#ffffff', }}>
                <Header
                    left={(
                        <TouchableOpacity onPress={() => onClose()}>
                            <Icon
                                size={28}
                                color={theme.colors.primary}
                                name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
                            />
                        </TouchableOpacity>
                    )}
                    title={(
                        <>
                            <Text
                                color="primary"
                                variant="title3"
                                numberOfLines={1}
                            >Session Details</Text>
                        </>
                    )}
                    center ={(
                        <>
                            <PrintBarCode 
                                session={session}
                            />
                        </>
                    )}
                    right={(
                        <>
                            <PrintSession 
                                session={session} 
                                showConfidential 
                            />
                             
                        </>
                    )}
                />

                <View style={{ flex: 1, }}>
                    <ErrorBoundary
                        FallbackComponent={() => <SessionErrorFallback onClose={onClose} />}
                        onError={(error, stackTrace) => {
                            logFatal('session.detailsErrorBoundary', { message: error.message, stack: stackTrace }, { sessionId: session?.id });
                        }}
                    >
                        <FormAndDiagnosesSummary
                            session={session}
                            showConfidential={showConfidential}
                            showNonPrintable
                            onShowConfidential={show => setShowConfidential(show)}
                        />
                    </ErrorBoundary>
                </View>
            </Box>
        </Modal>
    );
}
