import { Image, Modal, View, Dimensions } from "react-native";

const { width: winW } = Dimensions.get('window');

import { assets } from "@/constants";
import { Poster } from "./poster";

type Props = {
    children?: React.ReactNode;
};

export function Splash({ children }: Props) {
    return (
        <>
            <Modal
                statusBarTranslucent
                transparent
                visible
                onRequestClose={() => {}}
            >
                <View className="flex-1 bg-background">
                    <Poster>
                        {children}
                    </Poster>
                </View>
            </Modal>        
        </>
    )
}