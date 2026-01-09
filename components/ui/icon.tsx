import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';

export type IconProps = ComponentProps<typeof MaterialIcons>;

export function Icon({
    name,
    size = 24,
    color,
    style,
}: IconProps) {
    return (
        <MaterialIcons 
            color={color} 
            size={size} 
            name={name} 
            style={style} 
        />
    );
}