import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Content, Br, Text } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';

export function Fab( { onPress }: { onPress?: () => void }) {
    const theme = useTheme();
    
    return (
        <>
            <TouchableOpacity
                style={{
                    backgroundColor: theme.palette.info.main,
                    width: 50,
                    height: 50,
                    borderRadius: 30,
                    position: 'absolute',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                }}
                onPress={onPress}
            >
                <MaterialIcons 
                    color={theme.palette.primary.contrastText}
                    size={30}
                    name="arrow-forward"
                />
            </TouchableOpacity>
        </>
    );
};
