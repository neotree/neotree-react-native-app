import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as types from '../types';
import { Location } from './Location';
import { Login } from './Login';

const AuthenticationStack = createNativeStackNavigator<types.AuthenticationRoutes>();

export function AuthenticationNavigator() {
    return ( 
        <AuthenticationStack.Navigator screenOptions={{headerShown: false }}>
            <AuthenticationStack.Screen
                name="Location"
                component={Location}
            />

            <AuthenticationStack.Screen
                name="Login"
                component={Login}
            />
        </AuthenticationStack.Navigator>
    );
}
