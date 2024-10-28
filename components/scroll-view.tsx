import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, ScrollView as RNScrollView, ScrollViewProps, LayoutRectangle } from "react-native";

const { height } = Dimensions.get('window');

type Props = ScrollViewProps & {
    minHeight?: 'full' | number;
};

export const ScrollView = forwardRef<RNScrollView, Props>(({ minHeight, ...props }, ref) => {
    const scrollViewRef = useRef<RNScrollView>(null);

    useImperativeHandle(ref, () => scrollViewRef.current!);

    const [top, setTop] = useState(0);

    useEffect(() => {
        if (scrollViewRef.current) {
            // @ts-ignore
            scrollViewRef.current?.measure?.((w, h, px, py, fx, fy) => {
                setTop(fy);
            });
        }
    }, []);

    return (
        <RNScrollView 
            {...props}
            ref={scrollViewRef}
            contentContainerStyle={[
                { minHeight: minHeight === 'full' ? (height - (top || 0)) : minHeight, },
                props.contentContainerStyle
            ]}
        />
    );
});