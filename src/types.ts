import { RouteProp, ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export * from '../config/types';

export type Location = { 
  id: number;
  country: string;
  hospital?: string;
};

export type AuthenticatedUser = any;
export type Script = any;
export type Screen = any;
export type Diagnosis = any;

export interface StackNavigationProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> {
  navigation: NativeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
}

export type AppRoutes = {
  Authentication: undefined;
  Home: undefined;
};

export type AuthenticationRoutes = {
  Location: undefined;
  Login: undefined;
};

export type HomeRoutes = {
  Home: undefined;
  Script: { scriptId: string; };
  Configuration: undefined;
  Location: undefined;
  Sessions: undefined;
};
