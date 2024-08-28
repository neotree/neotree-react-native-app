import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from './Theme';


export type HeaderProps = {
    left?: React.ReactNode;
    title?: React.ReactNode;
    right?: React.ReactNode;
    center?: React.ReactNode;
};

export function Header({ left, title, right,center }: HeaderProps) {
    return (
        <Box flex={1} backgroundColor="white">
            <Box
                height={90}
                elevation={24}
                shadowColor="grey-600"
                shadowOffset={{ width: -2, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={3}
                alignItems="center"
                flexDirection="row"
                backgroundColor="white"
            >
                <SafeAreaView>
                    <Box
                        width="100%"
                        flexDirection="row"
                        alignItems="center"
                    >
                        {!!left && (
                            <Box
                                width={50}
                                padding="s"
                            >{left}</Box>
                        )}

                        <Box padding="s">{title}</Box>

                        <View style={{ marginLeft: 'auto' }} />

                        {!!center && (
                            <Box
                                width={50}
                                alignSelf={'center'}
                                
                        
                                
                            >{center}</Box>
                        )}

                        <View style={{ marginLeft: 'auto' }} />

                        {!!right && (
                            <Box padding="s">{right}</Box>
                        )}
                    </Box>
                </SafeAreaView>
            </Box>
        </Box>
    );
}
