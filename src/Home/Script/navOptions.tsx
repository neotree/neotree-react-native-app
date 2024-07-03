import React from 'react';
import { TouchableOpacity, Platform, View } from 'react-native';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as types from '../../types';
import { Theme, Text, Box, Modal, Radio } from '../../components';
import { MoreNavOptions } from './Context';

type GetNavOptionsParams = {
	script: null | types.Script;
	theme: Theme;
	activeScreen: null | types.Screen;
	activeScreenIndex: number;
	goBack: () => void;
	confirmExit: () => void;
	moreNavOptions: null | MoreNavOptions;
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

function RightActions({ color, screen, confirmExit }: { color?: string; screen: types.Screen; confirmExit: () => void; }) {
	const [openModal, setOpenModal] = React.useState(false);
	const [openInfoModal, setOpenInfoModal] = React.useState(false);

	return (
		<>
			<Box flexDirection="row" justifyContent="flex-end" columnGap="s">
				{!!screen?.data?.infoText && (
					<Box marginRight="s">
						<TouchableOpacity onPress={() => setOpenInfoModal(true)}>
							<Icon 
								name="info" 
								size={24} 
								color={color}
							/>
						</TouchableOpacity>
					</Box>
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
				<Radio
					label="Cancel script?"
					onChange={() => {
						setOpenModal(false);
						confirmExit();
					}}
				/>
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

const headerTitle: (params: GetNavOptionsParams) => DrawerNavigationOptions['headerTitle'] = 
    ({ script, activeScreen, moreNavOptions, goBack, confirmExit }) => 
        ({ tintColor }) => {
            const title = moreNavOptions?.title || (activeScreen ? activeScreen?.data?.title : script?.data?.title);
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    {!!script && (
                        <Box marginRight="s">
                            <TouchableOpacity onPress={() => goBack()}>
                                <Icon 
                                    name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
                                    size={28} 
                                    color={tintColor}
                                />
                            </TouchableOpacity>
                        </Box>
                    )}

                    <Box flex={1}>
                        <Text
                            style={{ color: tintColor }}
                            variant="title3"
                            numberOfLines={1}
                        >{title}</Text>
                        {!activeScreen ? null : (
                            <Text
                                color="textSecondary"
                                variant="caption"
                                numberOfLines={1}
                            >{script?.data?.title}</Text>
                        )}
                    </Box>
                    
                    {!!script && (
                        <Box>
                            <RightActions color={tintColor} screen={activeScreen} confirmExit={confirmExit} />
                        </Box>
                    )}
                </View>
            );
        }; 

export function getNavOptions(params: GetNavOptionsParams) {
	const opts: Partial<NativeStackNavigationOptions> = {};

	if (!params.script) {
		opts.headerTitle = headerTitlePlaceholder(params);
		// opts.headerLeft = headerLeftPlaceholder(params);
	} else {
		opts.headerTitle = headerTitle(params);
		// opts.headerLeft = headerLeft(params);
        // opts.headerRight = params.moreNavOptions?.hideHeaderRight ? () => null : (
		// 	params.moreNavOptions?.headerRight || headerRight(params)
		// );
	}
	
	return opts;
}
