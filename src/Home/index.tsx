import React from 'react';
import { View, Image } from 'react-native'
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItem,
	DrawerContentComponentProps,
	DrawerNavigationOptions
  } from '@react-navigation/drawer';
import { HomeRoutes } from '../types';
import { useTheme, Text, theme, Box } from '../components';
import assets from '../assets';
import { Home } from './Home';
import { Script } from './Script';
import { Configuration } from './Configuration';
import { Location } from './Location';
import { Sessions } from './Sessions';
import { useAppContext } from '../AppContext';

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

export function HomeNavigator() {
	const ctx = useAppContext();
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
						title: `Scripts v${ctx?.application?.webeditor_info?.version}`,
						drawerLabel: 'Scripts',
					}}
				/>

				<Drawer.Screen 
					name="Script" 
					component={Script} 
					options={{
						drawerItemStyle: { display: 'none' },
					}}
				/>

				<Drawer.Screen 
					name="Location" 
					component={Location} 
				/>	

				<Drawer.Screen 
					name="Sessions" 
					component={Sessions} 
				/>

				<Drawer.Screen 
					name="Configuration" 
					component={Configuration} 
				/>		
			</Drawer.Navigator>
		</>
	);
}``

function CustomDrawerContent(props: DrawerContentComponentProps) {
	const theme = useTheme();
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

				<View
					style={{
						flex: 1,
						backgroundColor: theme.colors['bg.light'],
						
					}}
				>
					<View style={{ marginTop: theme.spacing.xl, }} />

					{props.state.routes.map((route, i) => {
						const focused = i === props.state.index;
						const { title, drawerLabel } = props.descriptors[route.key].options;
						if ([
								'Script', 
								'Screen', 
							].includes(route.name)) return null;
						return (
							<View key={route.key}>
								<DrawerItem 
									focused={focused}
									key={route.key}
									activeBackgroundColor={theme.colors['bg.active']}
									inactiveBackgroundColor="transparent"
									pressColor={theme.colors['bg.active']}
									label={({ focused }) => (
										<Text
											color={focused ? 'primary' : undefined}
											style={{
												textTransform: 'uppercase',
											}}
										>{(drawerLabel || title || route.name) as string}</Text>
									)}
									onPress={() => {
										props.navigation.navigate(route.name);
									}}
								/>
							</View>
						)
					})}
					{/* <DrawerItemList {...props} /> */}
				</View>
			</DrawerContentScrollView>
		</Box>
	);
}

