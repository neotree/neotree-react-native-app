import React from 'react';
import { Box, Content, Fab, Text, TextInput } from '../../../components';
import { ScreenType } from './ScreenType';
import { useContext } from '../Context';

export function Screen() {
   
    const [searchVal, setSearchVal] = React.useState('');
    const [repeatableComplete,setRepeatableComplete]= React.useState(false)

    const {
        activeScreen,
        moreNavOptions,
        activeScreenEntry,
        summary, 
        getFieldPreferences,
        setMountedScreens,
        goNext
    } = useContext();
    const metadata = activeScreen?.data?.metadata;
    React.useEffect(()=>{
        if(metadata?.repeatable){
            const allComplete = Object.values(
                activeScreenEntry?.values?.find(v => v.key === "repeatables")?.value || {}
              ).every((group: any) =>
                Array.isArray(group)
                  ? group.every(item => item?.requiredComplete !== false)
                  : true
              );
              setRepeatableComplete(allComplete)
        }else{
            setRepeatableComplete(true)
        }
    },[activeScreenEntry])
    
    return (
        <Box flex={1}>
            {!!activeScreen?.data?.actionText && (
                <Box backgroundColor="primary">
                    <Content>
                        <Box 
                            flexDirection="row"                            
                        >
                            <Box flex={1}>
                                <Text
                                    color="primaryContrastText"
                                    style={getFieldPreferences('actionText')?.style}
                                >{activeScreen?.data?.actionText}</Text>
                            </Box>

                            {!!activeScreen?.data?.step && (
                                <Box>
                                    <Text
                                        color="primaryContrastText"
                                    >{activeScreen?.data?.step}</Text>
                                </Box>
                            )}
                        </Box>
                    </Content>
                </Box>
            )}

            {!moreNavOptions?.hideSearch && ['multi_select', 'diagnosis', 'single_select'].includes(activeScreen?.type) && (
                <Content>
                    <TextInput
                        placeholder="Search"
                        onChangeText={val => setSearchVal(val)}
                        returnKeyType="search"
                    />
                </Content>
            )}

            <ScreenType searchVal={searchVal} />

            {((!!activeScreenEntry && !!repeatableComplete) || moreNavOptions?.showFAB) && (
                <Box 
                    position="absolute"
                    bottom={10}
                    right={20}
                >
                    <Fab 
                        icon={summary ? 'check' : undefined}
                        onPress={() => {
							setMountedScreens(prev => ({
								...prev,
								[activeScreen.id]: true,
							}));
                            if (moreNavOptions?.goNext) {
                                moreNavOptions.goNext();
                            } else {
                                goNext();
                            }
                            setSearchVal('');                            
                        }} 
                    />
                </Box>
            )}
        </Box>
    );
}
