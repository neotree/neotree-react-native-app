import { forwardRef } from "react";
import { Dimensions, ScrollView as RNScrollView, ScrollViewProps } from "react-native";

const { height } = Dimensions.get('window');

type Props = ScrollViewProps & {
    minHeight?: 'full' | number;
};

export const ScrollView = forwardRef<RNScrollView, Props>(({ minHeight, ...props }, ref) => {
    return (
        <RNScrollView 
            {...props}
            ref={ref}
            contentContainerStyle={[
                { minHeight: minHeight === 'full' ? height : minHeight, },
                props.contentContainerStyle
            ]}
        />
    );
});