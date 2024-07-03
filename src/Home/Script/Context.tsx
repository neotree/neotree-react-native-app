import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
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
    headerRight?: DrawerNavigationOptions['headerRight'];
};

export type PatientDetails = {
	isTwin: boolean;
	twinID: string;
};

export type ContextType = ReturnType<typeof getScriptUtils> & {
    generatedUID: string;
	script_id: string | number;
	sessionID: null | number | string;
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
    summary: any;
    matched: null | types.MatchedSession;
    mountedScreens: { [id: string]: boolean; };
	patientDetails: PatientDetails;
    nuidSearchForm: types.NuidSearchFormField[];
    setNuidSearchForm: React.Dispatch<React.SetStateAction<types.NuidSearchFormField[]>>;
	setPatientDetails: React.Dispatch<React.SetStateAction<PatientDetails>>;
	saveSession: (params?: any) => Promise<any>;
	createSummaryAndSaveSession: (params?: any) => Promise<any>;
	setSessionID: React.Dispatch<React.SetStateAction<string | number | null>>;
    setMountedScreens: React.Dispatch<React.SetStateAction<{ [id: string]: boolean; }>>;
    setMatched: React.Dispatch<React.SetStateAction<null | types.MatchedSession>>;
    getBirthFacilities: () => any[];
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
    getPrepopulationData: (prePopulationRules?: string[]) => any;
    getEntryValues: (key: string) => any[];
};

export const Context = React.createContext<null | ContextType>(null);

export const useContext = () => React.useContext(Context)!;

export function useDiagnoses() {
	const ctx = useContext();
	const metadataItems = ctx.activeScreen.data.metadata.items || [];
	const allDiagnoses = ctx.diagnoses;

	const diagnoses: any[] = metadataItems.map((item: any) => {
        const d = allDiagnoses.map(d => ({ ...d.data, ...d })).filter(d => d.name === item.label)[0];
        return {
            ...item,
            ...(!d ? null : {
                text1: d.text1,
                image1: d.image1,
                text2: d.text2,
                image2: d.image2,
                text3: d.text3,
                image3: d.image3,
                symptoms: d.symptoms || [],
            }),
        };
    });

	return { allDiagnoses, diagnoses, };
}
