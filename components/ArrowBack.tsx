import React from 'react';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme  } from '@/components/ui';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '@/types';

type ArrowBackProps = {
    color?: string;
    navigation: NavigationProp<RootStackParamList>;
};

export const ArrowBack = ({ navigation, color }: ArrowBackProps) => {
    const theme = useTheme();    

    return (
        <Pressable
            onPress={() => navigation.goBack()}
        >
            <MaterialIcons
                name="arrow-back"
                size={25}
                color={color || theme.palette.text.primary}
                style={{ marginRight: theme.spacing() }}
            />
        </Pressable>
    );
}
