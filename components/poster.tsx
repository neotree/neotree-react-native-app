import { Image, Modal, View, Dimensions } from "react-native";

const { width: winW } = Dimensions.get('window');

import { assets } from "@/constants";

type Props = {
    children?: React.ReactNode;
};

export function Poster({ children }: Props) {
    return (
        <>
            <View className="flex-1 p-10">
                <View className="flex-1 justify-center items-center">
                    <Image
                        style={{
                            width: winW * 0.5,
                            height: winW * 0.5,
                            maxWidth: 300,
                            maxHeight: 300,
                        }}
                        source={assets.logo}
                    />
                </View>    

                <View className="flex justify-center items-center">
                    {children}
                </View>
            </View> 
        </>
    )
}