import React from 'react';
import { Keyboard } from 'react-native';
import { Box, Button, Content } from '../../../components';
import { useContext } from '../Context';
import { Search } from './Search';
import { Transfer } from './Transfer';

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
                    {ctx?.script?.type === 'admission' && <Transfer />}
                    {ctx?.script?.type === 'discharge' && <Search label="Search existing NUID" />}
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
