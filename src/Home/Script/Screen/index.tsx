import React from 'react';
import { Box, Content, Fab, Text, TextInput } from '../../../components';
import { ScreenType } from './ScreenType';
import { useContext } from '../Context';

export function Screen() {
    const ctx = useContext();
    const [searchVal, setSearchVal] = React.useState('');
    
    return (
        <Box flex={1}>
            {!!ctx.activeScreen?.data?.actionText && (
                <Box backgroundColor="primary">
                    <Content>
                        <Box 
                            flexDirection="row"                            
                        >
                            <Box flex={1}>
                                <Text
                                    color="primaryContrastText"
                                >{ctx.activeScreen?.data?.actionText}</Text>
                            </Box>

                            {!!ctx.activeScreen?.data?.step && (
                                <Box>
                                    <Text
                                        color="primaryContrastText"
                                    >{ctx.activeScreen?.data?.step}</Text>
                                </Box>
                            )}
                        </Box>
                    </Content>
                </Box>
            )}

            {!ctx.moreNavOptions?.hideSearch && ['multi_select', 'diagnosis', 'single_select'].includes(ctx.activeScreen?.type) && (
                <Content>
                    <TextInput
                        placeholder="Search"
                        onChangeText={val => setSearchVal(val)}
                        returnKeyType="search"
                    />
                </Content>
            )}

            <ScreenType searchVal={searchVal} />

            {(!!ctx.activeScreenEntry || ctx.moreNavOptions?.showFAB) && (
                <Box 
                    position="absolute"
                    bottom={10}
                    right={20}
                >
                    <Fab 
                        icon={ctx.summary ? 'check' : undefined}
                        onPress={() => {
							ctx.setMountedScreens(prev => ({
								...prev,
								[ctx.activeScreen.id]: true,
							}));
                            if (ctx.moreNavOptions?.goNext) {
                                ctx.moreNavOptions.goNext();
                            } else {
                                ctx.goNext();
                            }
                            setSearchVal('');                            
                        }} 
                    />
                </Box>
            )}
        </Box>
    );
}
