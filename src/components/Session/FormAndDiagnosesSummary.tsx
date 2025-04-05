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
    const RootComponent = scrollable !== false ? ScrollView : React.Fragment;
    return (
        <Box>
            <RootComponent>
                <Summary {...props} />
            </RootComponent>
        </Box>
    )
}
