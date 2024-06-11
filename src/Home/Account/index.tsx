import { useState } from "react";
import { ScrollView, Alert, View } from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';

import { Content, Text, Box, Button, OverlayLoader } from '../../components';
import * as api from '../../data';
import { useAppContext } from "../../AppContext";

export function Account() {
    const ctx = useAppContext();
    const [displayLoader, setDisplayLoader] = useState(false);

	return (
        <View
            style={{ 
                flex: 1, 
                backgroundColor: '#fff', 
                borderTopColor: '#ddd', 
                borderTopWidth: 1, 
            }}
        >
            <Box flex={1}>
                <ScrollView>
                    <Content>
                        {/* <Text>{ctx.authenticatedUser}</Text> */}
                        <Box
                            flex={1}
                            flexDirection="row"
                            rowGap="m"
                            marginBottom="xl"
                            alignItems="center"
                        >
                            <Box>
                                <Icon name="account-circle" size={80} color="#999" />
                            </Box>

                            <Box>
                                <Text>{ctx.authenticatedUser.email}</Text>
                            </Box>
                        </Box>
                        {displayLoader && <OverlayLoader />}
                    </Content>
                </ScrollView>
            </Box>

            <Box 
                p="xl"
                borderTopWidth={1}
                borderTopColor="divider"
            >
                <Button
                    onPress={() => {
                        Alert.alert(
                            'Logout',
                            'Are you sure you want to logout?',
                            [
                                {
                                    text: 'Cancel',
                                },
                                {
                                    text: 'Yes',
                                    onPress: () => {
                                        (async () => {
                                            setDisplayLoader(true);
                                            await api.logout();
                                            setDisplayLoader(false);
                                            ctx.setAuthenticatedUser(null);
                                        })();
                                    },
                                },
                            ]
                        );
                    }}
                >
                    Logout
                </Button>

                <View style={{ marginVertical: 5 }} />

                <Button
                    variant="link"
                    onPress={() => {
                        Alert.alert(
                            'Reset app',
                            "Are you sure you want to reset the app? This will delete all the data and you'll be logged out!",
                            [
                                {
                                    text: 'Cancel',
                                },
                                {
                                    text: 'Yes',
                                    onPress: () => {
                                        (async () => {
                                            setDisplayLoader(true);
                                            await api.resetApp();
                                            await api.logout();
                                            setDisplayLoader(false);
                                            ctx.setAuthenticatedUser(null);
                                        })();
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <Text 
                        color="error"
                        textAlign="center"
                    >Reset app</Text>
                </Button>
            </Box>
        </View>
	);
}
