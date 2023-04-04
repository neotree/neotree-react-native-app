import React from 'react';
import { Keyboard } from 'react-native';
import { Box, Button, Content, Text, Radio, NeotreeIDInput } from '../../../components';
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
                    {/* {ctx?.script?.type === 'admission' && <Transfer />} */}
                    {ctx?.script?.type === 'discharge' ? 
                        <Search label="Search existing NUID" />
                        :
                        <Transfer />}

					{((ctx?.script?.data?.title || '').match(/admission/gi) || (ctx?.script?.data?.script?.type === 'admission')) && (
						<Box my="xl">
							<Text>Does the baby have a twin?</Text>
							<Box flexDirection="row">
								<Radio
									checked={ctx?.patientDetails?.isTwin}
									onChange={() => {
										ctx?.setPatientDetails(prev => ({ ...prev, isTwin: true, }));
									}}
									label="Yes"
								/>

								<Box mx="l" />

								<Radio
									checked={!ctx?.patientDetails?.isTwin}
									onChange={() => {
										ctx?.setPatientDetails(prev => ({ ...prev, isTwin: false, }));
									}}
									label="No"
								/>
							</Box>
							{ctx?.patientDetails?.isTwin && (
								<Box
									mt="xl"
								>
									<NeotreeIDInput 
										label="Twin Neotree ID"
										onChange={twinID => ctx?.setPatientDetails(prev => ({ ...prev, twinID }))}
										value={ctx?.patientDetails?.twinID}
									/>
								</Box>
							)}
						</Box>
					)}
                </Content>
            </Box>

            {keyboardIsOpen ? null : (
                <Box  
                    borderTopColor="divider"
                    borderTopWidth={1}
                >
                    <Content>
                        {!ctx?.matched?.session && (
                            <Box
                                padding="m"
                            >
                                <Text textAlign="center">Start a new session</Text>
                            </Box>
                        )}

                        <Button
                            disabled={!ctx?.screens?.length}
                            onPress={() => {
                                (async () => {
									try {
										ctx?.setActiveScreen(ctx?.screens[0]);
										ctx?.setActiveScreenIndex(0);
										ctx?.saveSession();
									} catch(e) { /**/ }
								})();
                            }}
                        >{ctx?.matched?.session ? 'Continue' : 'Start'}</Button>
                    </Content>
                </Box>
            )}
        </Box>
    );
}
