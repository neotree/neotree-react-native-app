import React from 'react';
import { Dimensions, Modal, TouchableOpacity, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, FormAndDiagnosesSummary, Header, PrintSession, useTheme, Text,PrintBarCode } from '../../components';
import * as types from '../../types';

export type SessionProps = {
    session: any;
    navigation: NativeStackNavigationProp<types.HomeRoutes, "Sessions", undefined>;
    onBack: () => void;
};

const { height: winH } = Dimensions.get('window');

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
            <Box backgroundColor="white" flex={1} height={winH}>
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

                <Box height={winH - 50}>
                    <FormAndDiagnosesSummary
                        session={session}
                        showConfidential={showConfidential}
                        onShowConfidential={show => setShowConfidential(show)}
                    />
                   
                </Box>
            </Box>
        </Modal>
    );
}
