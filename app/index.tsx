import { Redirect } from "expo-router";

import { useAsyncStorage } from "@/hooks/use-async-storage";
import { useAuthentication } from "@/hooks/use-authentication";

export default function IndexScreen() {
    const { authenticated, authInfoLoaded } = useAuthentication();
    const { ONBOARDING_DATE } = useAsyncStorage();

    if (!authInfoLoaded) return null;

    if (!authenticated) return <Redirect href="/(auth)" />;

    if (ONBOARDING_DATE) return <Redirect href="/(drawer)" />;
    
    return <Redirect href="/welcome" />;
}
