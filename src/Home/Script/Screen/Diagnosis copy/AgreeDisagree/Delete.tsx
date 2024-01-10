import React from 'react';
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../../../components';

type DeleteProps = {
	onDelete: () => void;
}

export function Delete({ onDelete }: DeleteProps) {
	const theme = useTheme();

	return (
		<>
			<TouchableOpacity
				onPress={() => {
					Alert.alert(
						'Delete diagnosis',
						'Are you sure?',
						[
							{
								text: 'Cancel',
								onPress: () => {},
								style: 'cancel'
							},
							{
								text: 'Yes',
								onPress: () => onDelete()
							}
						],
						{ cancelable: false }
					);
				}}
			>
				<Icon 
					size={30} 
					color={theme.colors.textDisabled} 
					name="delete" 
				/>
			</TouchableOpacity>
		</>
	);
}
