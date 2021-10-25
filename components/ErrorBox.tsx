import React from 'react';
import { Content, Text, View, Icon } from '@/components/ui';

export function ErrorBox({ error }: { error: string; }) {
    return (
        <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
            <Content>
                <Text color="error" variant="h5">{error}</Text>
            </Content>
        </View>
    );
}
