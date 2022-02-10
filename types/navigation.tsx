 import { DrawerScreenProps } from '@react-navigation/drawer';
 import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
 import { NativeStackScreenProps } from '@react-navigation/native-stack';
 
 declare global {
   namespace ReactNavigation {
     interface RootParamList extends RootStackParamList {}
   }
 }
 
 export type RootStackParamList = {
   Root: NavigatorScreenParams<RootDrawerParamList> | undefined;
   Modal: undefined;
   NotFound: undefined;
   Script: { 
     script_id: string | number; 
     screen_id?: string | number;
   };
 };
 
 export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
   RootStackParamList,
   Screen
 >;
 
 export type RootDrawerParamList = {
   Scripts: undefined;
   Configuration: undefined;
   History: undefined;
   Settings: undefined;
 };
 
 export type RootTabScreenProps<Screen extends keyof RootDrawerParamList> = CompositeScreenProps<
   DrawerScreenProps<RootDrawerParamList, Screen>,
   NativeStackScreenProps<RootStackParamList>
 >;
 