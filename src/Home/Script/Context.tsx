import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as types from '../../types';
import { getScriptUtils } from './utils';

export type MoreNavOptions = {
    goBack?: () => void;
    goNext?: () => void;
    title?: string;
    subtitle?: string;
    hideHeaderRight?: boolean;
    hideSubtitle?: boolean;
    showFAB?: boolean;
    hideSearch?: boolean;
};

export type ContextType = ReturnType<typeof getScriptUtils> & {
    script: types.Script;
    activeScreen: types.Screen;
    activeScreenIndex: number;
    screens: types.Screen[];
    diagnoses: types.Diagnosis[];
    navigation: NativeStackNavigationProp<types.HomeRoutes, "Script", undefined>;
    entries: types.ScreenEntry[];
    cachedEntries: types.ScreenEntry[];
    activeScreenEntry?: types.ScreenEntry;
    configuration: types.Configuration;
    application: null | types.Application;
    location: null | types.Location;
    moreNavOptions: null | MoreNavOptions;
    goNext: () => void;
    goBack: () => void;
    setEntries: React.Dispatch<React.SetStateAction<types.ScreenEntry[]>>;
    setCachedEntries: React.Dispatch<React.SetStateAction<types.ScreenEntry[]>>;
    setActiveScreen: React.Dispatch<React.SetStateAction<types.Screen>>;
    setActiveScreenIndex: React.Dispatch<React.SetStateAction<number>>;
    setCacheEntry: (entry: types.ScreenEntry) => void;
    getCachedEntry: (screenIndex: number) => void;
    setEntry: (entry: types.ScreenEntry) => void;
    removeEntry: (screenId: string | number) => void;
    setEntryValues: (values?: types.ScreenEntry['values'], otherValues?: any) => void;
    setNavOptions: () => void;
    setMoreNavOptions: React.Dispatch<React.SetStateAction<null | MoreNavOptions>>;
};

export const Context = React.createContext<null | ContextType>(null);

export const useContext = () => React.useContext(Context);
