import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as types from '../../types';

export type ContextType = {
    script: types.Script;
    activeScreen: types.Screen;
    activeScreenIndex: number;
    screens: types.Screen[];
    diagnoses: types.Diagnosis[];
    navigation: NativeStackNavigationProp<types.HomeRoutes, "Script", undefined>;
};

export const Context = React.createContext<null | ContextType>(null);

export const useContext = () => React.useContext(Context);
