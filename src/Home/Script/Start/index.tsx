import React from 'react';
import { Keyboard } from 'react-native';
import { Box, Button, Content } from '../../../components';
import { useContext } from '../Context';
import { Search } from './Search';

export function Start() {
    const ctx = useContext();

    const [keyboardIsOpen, setKeyboardIsOpen] = React.useState(false);

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardIsOpen(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardIsOpen(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <Box flex={1} paddingTop="xl">
            <Box flex={1}>
                <Content>
                    <Search />
                </Content>
            </Box>

            {keyboardIsOpen ? null : (
                <Box 
                    alignContent="center" 
                    justifyContent="center"
                >
                    <Content>
                        <Button
                            disabled={!ctx?.screens?.length}
                            onPress={() => {
                                ctx?.setActiveScreen(ctx?.screens[0]);
                                ctx?.setActiveScreenIndex(0);
                            }}
                        >Start</Button>
                    </Content>
                </Box>
            )}
        </Box>
    );
}
