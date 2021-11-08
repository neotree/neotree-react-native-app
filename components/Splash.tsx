import React from 'react';
import { View } from 'react-native';
import { useTheme, Loader } from '@/components/ui';
import { Logo } from '@/components/Logo';

export type SplashProps = {
    children?: React.ReactNode;
    loader?: boolean;
}

export function Splash({ children, loader }: SplashProps) {
    const theme = useTheme();

    return (
        <>
            <View 
                style={{ 
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <View>
                    <Logo size="large" />
                    {children}
                </View>
            </View>
            {loader && (
                    <View
                        style={{ 
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: theme.spacing(3),
                        }}
                    ><Loader size="large" /></View>
                )}
        </>
    )
}
