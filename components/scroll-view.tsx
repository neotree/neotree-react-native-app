import { Dimensions, ScrollView as RNScrollView, ScrollViewProps } from "react-native";

const { height } = Dimensions.get('window');

export function ScrollView({ minHeight, ...props }: ScrollViewProps & {
    minHeight?: 'full' | number;
}) {
    return (
        <RNScrollView 
            {...props}
            contentContainerStyle={[
                { minHeight: minHeight === 'full' ? height : minHeight, },
                props.contentContainerStyle
            ]}
        />
    )
}