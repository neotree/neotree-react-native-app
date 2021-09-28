import React from 'react';
import { Text } from 'react-native';
import { RootTabScreenProps } from '../../types/navigation';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
    return (
        <Text style={{ fontSize: 60, fontWeight: 'bold' }}>Home</Text>
    );
};
