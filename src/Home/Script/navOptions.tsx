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
	activeScreen: null | types.Screen;
	activeScreenIndex: number;
	goBack: () => void;
	confirmExit: () => void;
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

const headerLeft: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerLeft'] = ({ goBack }) => 
	({ tintColor }) => {
		return (
			<Box marginLeft="m">
				<TouchableOpacity onPress={() => goBack()}>
					<Icon 
						name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
						size={28} 
						color={tintColor}
					/>
				</TouchableOpacity>
			</Box>
		);
	};

function RightActions({ color, screen, confirmExit, }: { color?: string; screen: types.Screen; confirmExit: () => void; }) {
	const [openModal, setOpenModal] = React.useState(false);
	const [openInfoModal, setOpenInfoModal] = React.useState(false);

	return (
		<>
			<Box marginRight="m" flexDirection="row">
				{!!screen?.data?.infoText && (
					<>
						<TouchableOpacity onPress={() => setOpenInfoModal(true)}>
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
				actions={[
					{
						label: 'Cancel',
						onPress: () => setOpenModal(false),
					}
				]}
			>
				<TouchableOpacity 
					onPress={() => {
						setOpenModal(false);
						confirmExit();
					}}
				>
					<Text>Cancel Script?</Text>
				</TouchableOpacity>
			</Modal>

			<Modal
				open={openInfoModal}
				onClose={() => setOpenInfoModal(false)}
				onRequestClose={() => setOpenInfoModal(false)}
				title="Screen Info"
				actions={[
					{
						label: 'Cancel',
						onPress: () => setOpenInfoModal(false),
					}
				]}
			>
				<Text>{screen?.data?.infoText}</Text>
			</Modal>
		</>
	);
}

const headerRight: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerRight'] = ({ activeScreen, confirmExit }) =>
	({ tintColor }) => {
		return <RightActions color={tintColor} screen={activeScreen} confirmExit={confirmExit} />;
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
