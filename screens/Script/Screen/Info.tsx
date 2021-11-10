import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Content, useTheme, Text, Br, } from '@/components/ui';
import * as copy from '@/constants/copy/script';
import { Screen } from '@/types';

export function ScreenInfo({ screen }: { screen: Screen; }) {
    const theme = useTheme();

    const [openModal, setOpenModal] = React.useState(false);

    if (!screen.data.infoText) return null;

    return (
        <>
            <TouchableOpacity
                style={{ alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setOpenModal(true)}
            >
                <MaterialIcons 
                    name="info-outline"
                    size={20}
                    color={theme.palette.primary.main}
                />
            </TouchableOpacity>
            
            <Modal
                transparent
                statusBarTranslucent
                visible={openModal}
                onRequestClose={() => setOpenModal(false)}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        justifyContent: 'center', 
                        paddingVertical: theme.spacing(2),
                        backgroundColor: 'rgba(0,0,0, 0.5)', 
                    }}
                >
                    <Content 
                        variant="outlined"
                    >
                        <ScrollView>
                            <Text variant="h6">{copy.SCREEN_INFO}</Text>
                            <Br />
                            <Text>{screen.data.infoText}</Text>
                            <Br />
                            <View
                                style={{ alignItems: 'flex-end' }}
                            >
                                <TouchableOpacity onPress={() => setOpenModal(false)}>
                                    <Text variant="button" color="primary">
                                        {copy.CLOSE}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Content>
                </View>
            </Modal>
        </>
    );
}
