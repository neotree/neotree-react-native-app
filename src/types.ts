import { RouteProp, ParamListBase } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

export interface DrawerNavigationProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> {
  navigation: DrawerNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
}

export type Routes = {
  Home: undefined;
  Script: { scriptId: string; };
  Configuration: undefined;
  Location: undefined;
  Sessions: undefined;
};
