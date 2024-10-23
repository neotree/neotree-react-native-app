import { ActivityIndicator, ActivityIndicatorProps, Modal, View } from "react-native";
import clsx from "clsx";

import { useTheme } from "@/hooks/use-theme";

type Props = ActivityIndicatorProps & {
    overlay?: boolean;
    overlayTransparent?: boolean;
};

export function Loader({ 
    overlay, 
    overlayTransparent = true, 
    ...props 
}: Props) {
    const theme = useTheme();

    const loader = (
        <>
            <ActivityIndicator 
                color={theme.primaryColor}
                size={24}
                {...props}
            />
        </>
    );

    if (overlay) {
        return (
            <Modal
                statusBarTranslucent
                transparent
                visible
                onRequestClose={() => {}}
            >
                <View
                    className={clsx(
                        'flex-1 items-center justify-center',
                        !overlayTransparent ? 'bg-background' : 'bg-transparent',
                    )}
                >
                    {loader}
                </View>
            </Modal>
        );
    }

    return loader;
}
