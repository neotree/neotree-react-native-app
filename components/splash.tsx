import {  Modal, View } from "react-native";

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
                        <View className="p-10">
                            {children}
                        </View>
                    </Poster>
                </View>
            </Modal>        
        </>
    )
}