import { Image } from "react-native";

import { assets } from "@/constants";

type Props = {

};

export function Logo({}: Props) {
    return (
        <>
            <Image 
                source={assets.logo}
                className="w-40 h-40"
            />
        </>
    );
}