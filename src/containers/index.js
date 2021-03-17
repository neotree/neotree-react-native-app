import React from 'react';
import { Image, View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import LazComponent from '@/components/LazyComponent';
import Logo from '@/components/Logo';
import { useAppContext } from '@/AppContext';
import theme from '~/native-base-theme/variables/commonColor';

const Authentication = LazComponent(() => import('./Authentication'));
const Location = LazComponent(() => import('./Location'));
const Scripts = LazComponent(() => import('./Scripts'));
const Script = LazComponent(() => import('./Script'));
const Configuration = LazComponent(() => import('./Configuration'));
const Sessions = LazComponent(() => import('./Sessions'));

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function Home() {
  return (
    <>
      <Drawer.Navigator
        initialRouteName="Scripts"
        drawerStyle={{ margin: 0, padding: 0, }}
        drawerContent={props => {
          const { navigation: { navigate } } = props; // eslint-disable-line
          return (
            <DrawerContentScrollView
              {...props}
            >
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 0,
                  height: 200,
                  backgroundColor: theme.buttonPrimaryBg,
                  padding: 0,
                  position: 'absolute',
                  top: 0,
                  width: '100%'
                }}
              ><Logo /></View>

              <View style={{ height: 200, marginBottom: 10, }} />

              <DrawerItemList {...props} />
              <DrawerItem label="Configuration" onPress={() => navigate('Configuration')} />
              <DrawerItem label="Sessions history" onPress={() => navigate('Sessions')} />
              <DrawerItem label="Sign out" onPress={() => alert('Link to help')} />
            </DrawerContentScrollView>
          );
        }}
      >
        <Drawer.Screen name="Scripts" component={Scripts} />
      </Drawer.Navigator>
    </>
  );
}

function Containers() {
  const { state: { authenticatedUser, location } } = useAppContext();

  if (!authenticatedUser) return <Authentication />;

  if (!location) return <Location />;

  return (
    <>
      <Stack.Navigator
        initialRouteName="Home"
        // mode="card"
        // headerMode="none"
        // screenOptions={{
        //   headerShown: false,
        //   cardStyle: { backgroundColor: '#fff' },
        // }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Configuration" component={Configuration} />
        <Stack.Screen name="Sessions" component={Sessions} />
        <Stack.Screen name="Script" component={Script} />
      </Stack.Navigator>
    </>
  );
}

export default Containers;
