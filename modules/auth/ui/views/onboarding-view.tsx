import { View } from 'react-native';

import { LocationForm } from '@/modules/location/ui/forms/location-form';

export function OnboardingView() {
    return (
        <View>
            <LocationForm
				buttonText="Continue"
				redirectTo="/(auth)/sign-in"
			/>
        </View>
    );
}
