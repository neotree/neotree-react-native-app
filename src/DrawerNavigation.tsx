import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItem,
	DrawerContentComponentProps,
  } from '@react-navigation/drawer';
import Icon from '@expo/vector-icons/MaterialIcons';
import {
	Home,
	Script,
	Configuration,
	Location,
	Sessions,
} from './screens';
import { Routes } from './types';
import { useTheme, Typography } from './components';
import { useNavigation } from '@react-navigation/native';

export const drawerNavAssets = [require('../assets/logos/piket_Location.png')];

const Drawer = createDrawerNavigator<Routes>();

export function DrawerNavigation() {
	const theme = useTheme();
	return (
		<Drawer.Navigator 
			initialRouteName="Home"
			drawerContent={props => <CustomDrawerContent {...props} />}
		>
			<Drawer.Screen 
				name="Home" 
				component={Home} 
				options={{
					// headerShown: false,
					headerStyle: {
						backgroundColor: theme.colors['bg.dark'],
					},
					headerTintColor: theme.colors['bg.dark.contrast'],
					headerShadowVisible: false,
					headerTitle: () => (
						<Typography
							size="lg"
							font="normal"
							style={{
								color: theme.colors['bg.dark.contrast'],
							}}
						>Home</Typography>
					),
				}}
			/>

			<Drawer.Screen 
				name="Script" 
				component={Script} 
				options={{
					drawerLabel: 'Script',
					headerLeft: props => HeaderLeft({ ...props, backRouteName: 'Script', }),
					headerTitle: () => (
						<View>
							<Typography
								size="lg"
								font="normal"
							>Script</Typography>
							<Typography
								size="xs"
								font="normal"
								color="text.secondary"
							>Step 1 of 3</Typography>
						</View>
					),
				}}
			/>

			<Drawer.Screen 
				name="Location" 
				component={Location} 
				options={{
					headerLeft: HeaderLeft,
					headerTitle: () => (
						<Typography
							size="lg"
							font="normal"
						>Location</Typography>
					),
				}}
			/>	

			<Drawer.Screen 
				name="Sessions" 
				component={Sessions} 
				options={{
					headerLeft: props => HeaderLeft({ ...props, backRouteName: 'Location', }),
					headerTitle: () => (
						<Typography
							size="lg"
							font="normal"
						>Details</Typography>
					),
				}}
			/>

			<Drawer.Screen 
				name="Configuration" 
				component={Configuration} 
				options={{
					headerLeft: HeaderLeft,
					headerTitle: () => (
						<Typography
							size="lg"
							font="normal"
						>Configuration</Typography>
					),
				}}
			/>		
		</Drawer.Navigator>
	);
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
	const theme = useTheme();
	return (
		<DrawerContentScrollView 
			{...props}
			contentContainerStyle={{
				flex: 1,
				backgroundColor: theme.colors['bg.dark']
			}}
		>
			<View
				style={{
					backgroundColor: theme.colors['bg.dark'],
					alignItems: 'center',
					justifyContent: 'center',					
				}}
			>
				<Image
					source={drawerNavAssets[0]}
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
									<Typography
										font="bold"
										color={focused ? 'primary' : undefined}
										style={{
											textTransform: 'uppercase',
										}}
									>{(drawerLabel || title || route.name) as string}</Typography>
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
	);
}

function HeaderLeft({ backRouteName }: any= {}) {
	const navigation = useNavigation();
	const theme = useTheme();
	return (
		<View style={{ flexDirection: 'row' }}>
			<TouchableOpacity
				onPress={() => {
					// @ts-ignore
					backRouteName ? navigation.navigate(backRouteName) : navigation.goBack();
				}}
			>
				<Icon 
					name="arrow-back" 
					size={24} 
					color={theme.colors.error}
					style={{
						paddingHorizontal: theme.spacing.md
					}}
				/>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
			>
				<Icon 
					name="menu" 
					size={24} 
					color={theme.colors['text.primary']}
					style={{
						paddingLeft: theme.spacing.md
					}}
				/>
			</TouchableOpacity>
		</View>
	);
}
