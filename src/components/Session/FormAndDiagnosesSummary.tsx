import React from "react";
import { ScrollView } from "react-native";
import { Box } from "../Theme";
import { Summary } from "./Summary";

type FormAndDiagnosesSummaryProps = {
    session: any;
    showConfidential?: boolean;
    scrollable?: boolean;
    onShowConfidential?: (show: boolean) => void;
};

export function FormAndDiagnosesSummary({
    scrollable,
    ...props
}: FormAndDiagnosesSummaryProps) {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [scrollOffset, setScrollOffset] = React.useState(0);

    const handleScroll = (event: any) => {
        setScrollOffset(event.nativeEvent.contentOffset.y);
    };

    const RootComponent = scrollable !== false ? ScrollView : React.Fragment;

    const scrollProps = scrollable !== false ? {
        ref: scrollViewRef,
        onScroll: handleScroll,
        scrollEventThrottle: 16,
        scrollsToTop: false,
    } : {};

    return (
        <Box>
            {scrollable !== false ? (
                <ScrollView {...scrollProps}>
                    <Summary {...props} />
                </ScrollView>
            ) : (
                <Summary {...props} />
            )}
        </Box>
    )
}
