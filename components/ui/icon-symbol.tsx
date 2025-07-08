import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING = {
    'house.fill': 'home',
    'clock.circle.fill': 'history',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-right',
} as IconMapping;

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

export type IconSymbolProps = {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
};

export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: IconSymbolProps) {
    return (
        <MaterialIcons 
            color={color} 
            size={size} 
            name={MAPPING[name]} 
            style={style} 
        />
    );
}
