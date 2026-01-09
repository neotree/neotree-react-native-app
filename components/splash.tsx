import { useAppContext } from '@/contexts/app';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
    const { initialised, authenticatedUser } = useAppContext();

    if (initialised) {
        SplashScreen.hide();
    }

    return null;
}
