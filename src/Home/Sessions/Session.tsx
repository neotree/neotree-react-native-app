import React from 'react';
import { Dimensions, Modal, TouchableOpacity, Platform, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Box, FormAndDiagnosesSummary, Header, PrintSession, useTheme,PrintBarCode,Text} from '../../components';
import * as types from '../../types';

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
                    <FormAndDiagnosesSummary
                        session={session}
                        showConfidential={showConfidential}
                        onShowConfidential={show => setShowConfidential(show)}
                    />
                   
                </View>
            </Box>
        </Modal>
    );
}
