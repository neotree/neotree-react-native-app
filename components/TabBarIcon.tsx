import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export const TabBarIcon = (props: { name: React.ComponentProps<typeof MaterialIcons>['name']; color: string; }) => (
    <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />
);
