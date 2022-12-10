import { StyleSheet, Text, TextProps } from "react-native";
import { Theme, useTheme } from "./theme";

export type TypographyProps = TextProps & {
    size: keyof Theme['textSize'];
    font: keyof Theme['fontType'];
    color: keyof Theme['colors'];
};

export function Typography({ 
    style, 
    font,
    size,
    color,
    ...props 
}: TypographyProps) {
    const theme = useTheme();
    return (
        <Text 
            {...props}
            style={[                
                styles.root, 
                {
                    fontFamily: theme.fontType[font],
                    fontSize: theme.textSize[size],
                    color: theme.colors[color],
                },
                style,
            ]}
        />
    );
}

Typography.defaultProps = {
    size: 'md',
    font: 'normal',
    color: 'text.primary',
};

const styles = StyleSheet.create({
    root: {
        fontSize: 16,
    },
});
