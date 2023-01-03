import React from 'react';
import { TouchableOpacity } from 'react-native';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as types from '../../types';
import { Theme, Text, Box, } from '../../components';

type GetNavOptionsParams = {
	script: null | types.Script;
	theme: Theme;
	confirmExit: () => void;
	activeScreen: null | types.Screen;
	activeScreenIndex: number;
};

const headerTitlePlaceholder: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = () => 
	props => {
		return (
			<Box>
			
			</Box>
		);
	};

const headerLeftPlaceholder: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerLeft'] = () => 
	props => {
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
						name="arrow-back" 
						size={28} 
						color={tintColor}
					/>
				</TouchableOpacity>
			</Box>
		);
	};

export function getNavOptions(params: GetNavOptionsParams) {
	if (!params.script) {
		return {
			headerTitle: headerTitlePlaceholder(params),
			headerLeft: headerLeftPlaceholder(params),
		};
	}
	
	return {
		headerTitle: headerTitle(params),
		headerLeft: headerLeft(params),
	};
}
