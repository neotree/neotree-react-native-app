import React from 'react';
import { View, Image, Alert } from 'react-native'
import Icon from '@expo/vector-icons/MaterialIcons';
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItem,
	DrawerContentComponentProps,
	DrawerNavigationOptions
  } from '@react-navigation/drawer';
import { HomeRoutes } from '../types';
import { useTheme, Text, theme, Box, Br, OverlayLoader } from '../components';
import assets from '../assets';
import { Home } from './Home';
import { Script } from './Script';
import { Configuration } from './Configuration';
import { Location } from './Location';
import { Sessions } from './Sessions';
import {PrintGenericBarCode} from './BarCode/GenericBarCodePrint'
import { useAppContext } from '../AppContext';
import {} from '../components/'
import * as api from '../data';

const Drawer = createDrawerNavigator<HomeRoutes>();

const HeaderTitle: DrawerNavigationOptions['headerTitle'] = props => {
	return (
		<Text
			style={{ color: props.tintColor }}
			variant="title3"
			fontWeight="bold"
		>
			{props.children}
		</Text>
	);
};

type HomeNavigatorProps = {};

export function HomeNavigator({}: HomeNavigatorProps) {
	const {application} = useAppContext()||{};
	return (
		<>
			<Drawer.Navigator 
				initialRouteName="Home"
				drawerContent={props => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerTintColor: theme.colors.primary,
					headerTitle: HeaderTitle
				}}
			>
				<Drawer.Screen 
					name="Home" 
					component={Home} 
					options={{
						title: `Scripts v${application?.webeditor_info?.version}`,
						drawerLabel: 'Home',
					}}
				/>

				<Drawer.Screen 
					name="Script" 
					component={Script} 
					options={{
						drawerItemStyle: { display: 'none' },
                        headerTitleContainerStyle: { width: '100%', },
                        headerLeft: () => null,
					}}
				/>

				<Drawer.Screen 
					name="Configuration" 
					component={Configuration} 
				/>	

				<Drawer.Screen 
					name="Sessions" 
					component={Sessions} 
					options={{
						drawerLabel: 'History'
					}}
				/>

				<Drawer.Screen 
					name="Location" 
					component={Location} 
				/>	

				<Drawer.Screen 
					name="QrCode" 
					component={PrintGenericBarCode} 
					options={{
						drawerItemStyle: { display: 'none' },
					}}
				/>	
	
			</Drawer.Navigator>
		</>
	);
}``

function CustomDrawerContent(props: DrawerContentComponentProps) {
	const theme = useTheme();
	const [displayLoader, setDisplayLoader] = React.useState(false);
	const {setAuthenticatedUser} = useAppContext()||{};

	return (
		<Box 
			flex={1}
			backgroundColor="white"
		>
			<DrawerContentScrollView 
				{...props}
				contentContainerStyle={{
					flex: 1,
					backgroundColor: theme.colors['bg.light']
				}}
			>
				<View
					style={{
						backgroundColor: theme.colors['bg.light'],
						alignItems: 'center',
						justifyContent: 'center',					
					}}
				>
					<Image
						source={assets.darkLogo}
						style={{ width: 220, height: 220, }}
					/>
				</View>

				<Box
					flex={1}
					backgroundColor="bg.light"
				>
					<Br spacing="xl" />

					{props.state.routes.map((route, i) => {
						const focused = i === props.state.index;
						const { title, drawerLabel } = props.descriptors[route.key].options;
						if ([
								'Script', 
								'Screen', 
							].includes(route.name)) return null;
						return (
							<Box key={route.key}>
								<DrawerItem 
									focused={focused}
									key={route.key}
									activeBackgroundColor={theme.colors['bg.active']}
									inactiveBackgroundColor="transparent"
									pressColor={theme.colors['bg.active']}
									label={({ focused }) => (
										<Box flexDirection="row" alignItems="center">
											<Box paddingHorizontal="m">
												{(() => {
													switch(route.name) {
														case 'Home':
															return (
																<Icon 
																	size={24} 
																	name="home"
																	color={focused ? theme.colors.primary : theme.colors.textSecondary} 
																/>
															);
														case 'Configuration':
															return (
																<Icon 
																	size={24} 
																	name="settings"
																	color={focused ? theme.colors.primary : theme.colors.textSecondary} 
																/>
															);
														case 'Sessions':
															return (
																<Icon 
																	size={24} 
																	name="history"
																	color={focused ? theme.colors.primary : theme.colors.textSecondary} 
																/>
															);
														case 'Location':
															return (
																<Icon 
																	size={24} 
																	name="location-pin"
																	color={focused ? theme.colors.primary : theme.colors.textSecondary} 
																/>
															);
															case 'QrCode':
															return (
																<Icon 
																	size={24} 
																	name="qr-code"
																	color={focused ? theme.colors.primary : theme.colors.textSecondary} 
																/>
															);
														default:
															return null;
													}
												})()}
											</Box>

											<Text
												color={focused ? 'primary' : 'textSecondary'}
												textTransform="uppercase"
												fontWeight="bold"
											>{(drawerLabel || title || route.name) as string}</Text>
										</Box>
									)}
									onPress={() => {
										props.navigation.navigate(route.name);
									}}
								/>
							</Box>
						)
					})}
				</Box>
			</DrawerContentScrollView>

			<Box 
				borderTopWidth={1} 
				borderTopColor="divider"
			/>

			<DrawerItem
				activeBackgroundColor={theme.colors['bg.active']}
				inactiveBackgroundColor="transparent"
				pressColor={theme.colors['bg.active']}
				onPress={() => {
					Alert.alert(
						'Logout',
						'Are you sure you want to logout?',
						[
							{
								text: 'Cancel',
							},
							{
								text: 'Yes',
								onPress: () => {
									(async () => {
										setDisplayLoader(true);
										await api.logout();
										setDisplayLoader(false);
										setAuthenticatedUser && setAuthenticatedUser(null);
									})();
								},
							},
						]
					);
				}}
				label={() => {
					return (
						<Box flexDirection="row" alignItems="center">
							<Box paddingHorizontal="m">
								<Icon 
									size={24} 
									name="logout"
									color={theme.colors.textSecondary} 
								/>
							</Box>
							<Text
								color="textSecondary"
								textTransform="uppercase"
								fontWeight="bold"
							>Logout</Text>
						</Box>
					)
				}}
			/>

			{displayLoader && <OverlayLoader />}
		</Box>
	);
}
