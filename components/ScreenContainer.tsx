import React from 'react';
import { View, ViewProps } from '@/components/ui';

export function ScreenContainer({ children, style, ...props }: ViewProps) {
    return (
        <>
            <View 
                {...props} 
                style={[
                    { flex: 1 },
                    // @ts-ignore
                    style?.map ? style.map : [style],
                ]}
            >
                {children}
            </View>
        </>
    );
}
