import { Redirect } from "expo-router";

import { useAppContext } from "@/contexts/app";

export default function IndexScreen() {
    const { authenticated } = useAppContext();

    if (authenticated) return <Redirect href="/(drawer)" />;
    
    return <Redirect href="/(auth)" />;
}
