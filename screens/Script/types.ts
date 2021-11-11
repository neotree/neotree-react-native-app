import { ScreenMetadataField } from '@/api/types';
import { Script, Screen, Configuration, Diagnosis, Application } from '@/api';

export type LoadApiDataResults = { 
    screens: Screen[]; 
    script: Script; 
    configuration: Configuration; 
    application: Application;
    diagnoses: Diagnosis[];
};

export type ApiData = {
    application: Application;
    script: Script;
    screens: Screen[];
    diagnoses: Diagnosis[];
    loadingScript: boolean;
    loadingScreens: boolean;
    loadingDiagnoses: boolean;
    loadingApplication: boolean;
    ready: boolean;
    error: string;
    loadScriptError: string;
    loadScreensError: string;
    configuration: Configuration;
    loadingConfiguration: boolean;
    loadConfigurationError: string;
    loadDiagnosesError: string;
    loadApplicationError: string;
    loadScreens: () => Promise<Screen[]>;
    loadScript: () => Promise<Script>;
    loadConfiguration: () => Promise<Configuration>;
    loadDiagnoses: () => Promise<Diagnosis[]>;
    loadData: () => Promise<LoadApiDataResults>;
    loadApplication: () => Promise<Application>;
};

export type ScreenComponentProps = {
    
};

export type ScreenFormFieldComponentProps = ScreenComponentProps & {
    field: ScreenMetadataField
};

export type EntryValue = {
    value: any;
    exportValue: any;
    confidential: any;
    valueText: string;
    key: string;
    label: string;
    type: string;
    dataType: string;
};

export type EntryScreen = {
    title: string;
    sectionTitle: string;
    id: string | number;
    screen_id: string | number;
    type: string;
    metadata: { label: string; dataType: string; };
};

export type Entry = {
    values: EntryValue[];
    screen: EntryScreen;
};

export type UseEntriesLogic = {
    removeEntry: (screenId: number | string) => void;
    activeScreenEntry: Entry;
    entries: Entry[];
    cachedEntries: Entry[];
    setEntry: (entry: Entry) => void;
    setCachedEntry: (entry: Entry) => void;
    screensWithNoAutoFill: { [screenId: string | number ]: boolean; };
};

export type UseScriptLogic = ApiData & UseEntriesLogic & {
    activeScreen: Screen;
    onBack: () => void;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'back') => { screen: Screen; index: number; };
    getSuggestedDiagnoses: () => Diagnosis[];
    getLastScreen: () => Screen;
};

export type ScriptContext = UseScriptLogic & {
    
}
