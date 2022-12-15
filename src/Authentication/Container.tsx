import React from 'react';
import { View, Image } from "react-native";
import assets from "../assets";
import { Content, Box  } from "../components";

export type ContainerProps = React.PropsWithChildren<{

}>;

export function Container({ children }: ContainerProps) {
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
					{children}
				</Content>
			</Box>
		</View>
	);
}
