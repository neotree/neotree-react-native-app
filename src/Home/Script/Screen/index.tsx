import React from 'react';
import { Box, Content, Fab, Text, TextInput } from '../../../components';
import { ScreenType } from './ScreenType';
import { useContext } from '../Context';
import {handleAppCrush} from '../../../utils/handleCrashes'

export function Screen() {
    const ctx = useContext()?.configuration;
    const [searchVal, setSearchVal] = React.useState('');
    React.useEffect(()=>{
        try{
            throw new Error('This is a test javascript crash!');
        }catch(e){
            handleAppCrush(e)
        }
    })   
    return (
        <Box flex={1}>
            {!!ctx?.activeScreen?.data?.actionText && (
                <Box backgroundColor="primary">
                    <Content>
                        <Box 
                            flexDirection="row"                            
                        >
                            <Box flex={1}>
                                <Text
                                    color="primaryContrastText"
                                >{ctx?.activeScreen?.data?.actionText}</Text>
                            </Box>

                            {!!ctx?.activeScreen?.data?.step && (
                                <Box>
                                    <Text
                                        color="primaryContrastText"
                                    >{ctx?.activeScreen?.data?.step}</Text>
                                </Box>
                            )}
                        </Box>
                    </Content>
                </Box>
            )}

            {!ctx?.moreNavOptions?.hideSearch && ['multi_select', 'diagnosis', 'single_select'].includes(ctx?.activeScreen?.type) && (
                <Content>
                    <TextInput
                        placeholder="Search"
                        onChangeText={val => setSearchVal(val)}
                        returnKeyType="search"
                    />
                </Content>
            )}

            <ScreenType searchVal={searchVal} />

            {(!!ctx?.activeScreenEntry || ctx?.moreNavOptions?.showFAB) && (
                <Box 
                    position="absolute"
                    bottom={10}
                    right={20}
                >
                    <Fab 
                        icon={ctx?.summary ? 'check' : undefined}
                        onPress={() => {
                            if (ctx?.moreNavOptions?.goNext) {
                                ctx.moreNavOptions.goNext();
                            } else {
                                ctx?.goNext();
                            }
                            setSearchVal('');                            
                        }} 
                    />
                </Box>
            )}
        </Box>
    );
}
