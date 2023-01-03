import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as types from '../../types';
import { Theme, Text, Box, Modal } from '../../components';

type GetNavOptionsParams = {
	script: null | types.Script;
	theme: Theme;
	confirmExit: () => void;
	activeScreen: null | types.Screen;
	activeScreenIndex: number;
};

const headerTitlePlaceholder: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = () => 
	() => {
		return (
			<Box>
			
			</Box>
		);
	};

const headerLeftPlaceholder: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerLeft'] = () => 
	() => {
		return (
			<Box>
			
			</Box>
		);
	};

const headerTitle: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = ({ script, activeScreen }) => 
	({ tintColor }) => {
		return (
			<Box>
				<Text
					style={{ color: tintColor }}
					variant="title3"
					numberOfLines={1}
				>{activeScreen ? activeScreen?.data?.title : script?.data?.title}</Text>
				{!activeScreen ? null : (
					<Text
						color="textSecondary"
						variant="caption"
						numberOfLines={1}
					>{script?.data?.title}</Text>
				)}
			</Box>
		);
	};

const headerLeft: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerLeft'] = ({ confirmExit }) => 
	({ tintColor }) => {
		return (
			<Box marginLeft="m">
				<TouchableOpacity onPress={() => confirmExit()}>
					<Icon 
						name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
						size={28} 
						color={tintColor}
					/>
				</TouchableOpacity>
			</Box>
		);
	};

function RightActions({ color, screen, }: { color?: string; screen: types.Screen }) {
	const [openModal, setOpenModal] = React.useState(false);
	return (
		<>
			<Box marginRight="m" flexDirection="row">
				{!!screen?.data?.infoText && (
					<>
						<TouchableOpacity onPress={() => setOpenModal(true)}>
							<Icon 
								name="info" 
								size={24} 
								color={color}
							/>
						</TouchableOpacity>

						<Box marginLeft="s" />
					</>
				)}

				<TouchableOpacity onPress={() => setOpenModal(true)}>
					<Icon 
						name="more-vert" 
						size={24} 
						color={color}
					/>
				</TouchableOpacity>
			</Box>

			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				onRequestClose={() => setOpenModal(false)}
				title="Action"
			>
				<Box>
					<Text>Cancel Script?</Text>
				</Box>
			</Modal>
		</>
	);
}

const headerRight: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerRight'] = ({ activeScreen }) =>
	({ tintColor }) => {
		return <RightActions color={tintColor} screen={activeScreen} />;
	};

export function getNavOptions(params: GetNavOptionsParams) {
	const opts: Partial<NativeStackNavigationOptions> = {};

	if (!params.script) {
		opts.headerTitle = headerTitlePlaceholder(params);
		opts.headerLeft = headerLeftPlaceholder(params);
		opts.headerRight = () => null;
	} else {
		opts.headerTitle = headerTitle(params);
		opts.headerLeft = headerLeft(params);
		opts.headerRight = headerRight(params);
	}
	
	return opts;
}
