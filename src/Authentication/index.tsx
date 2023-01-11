import React from 'react';
import { View, Image } from "react-native";
import assets from "../assets";
import { Content, Box  } from "../components";
import { Location } from './Location';
import { SignIn } from './SignIn';

type AuthenticationProps = {
	initialiseApp: () => Promise<void>;
};

export function Authentication({}: AuthenticationProps) {
    const [section, setSection] = React.useState<'location' | 'sign-in'>('location');

    const onSetLocation = React.useCallback(() => {
        setSection('sign-in');
    }, []);

    const onSignIn = React.useCallback(() => {

    }, []);

	return (
		<View style={{ flex: 1 }}>
			<View
				style={{ 
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Content>
					<Image 
						source={assets.darkLogo}
						style={{
							width: 300,
							height: 300,
						}}
					/>
				</Content>
			</View>

			<Box
				paddingVertical="m"
			>
				<Content>
					{section === 'location' && <Location onSetLocation={onSetLocation} />}
                    {section === 'sign-in' && <SignIn onSignIn={onSignIn} />}
				</Content>
			</Box>
		</View>
	);
}
