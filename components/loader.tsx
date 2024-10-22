import { ActivityIndicator, ActivityIndicatorProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type Props = ActivityIndicatorProps & {

};

export function Loader({ ...props }: Props) {
    const theme = useTheme();

    return (
        <>
            <ActivityIndicator 
                color={theme.primaryColor}
                size={24}
                {...props}
            />
        </>
    );
}
