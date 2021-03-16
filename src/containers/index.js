import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import LazComponent from '@/components/LazyComponent';
import * as SCREENS from '@/constants/SCREENS';
import { useAppContext } from '@/AppContext';

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
      <Drawer.Navigator initialRouteName="Scripts">
        <Drawer.Screen name={SCREENS.SCRIPTS.name} component={Scripts} />
        <Drawer.Screen name={SCREENS.CONFIGURATION.name} component={Configuration} />
        <Drawer.Screen name={SCREENS.SESSIONS.name} component={Sessions} />
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
          name={SCREENS.HOME.name}
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={SCREENS.SCRIPT.name} component={Script} />
      </Stack.Navigator>
    </>
  );
}

export default Containers;
