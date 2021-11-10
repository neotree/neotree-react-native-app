import { ScreenMetadataField } from '@/api/types';
import { Script, Screen, Configuration, Diagnosis } from '@/api';

export type LoadApiDataResults = { 
    screens: Screen[]; 
    script: Script; 
    configuration: Configuration; 
};

export type ApiData = {
    script: Script;
    screens: Screen[];
    diagnoses: Diagnosis[];
    loadingScript: boolean;
    loadingScreens: boolean;
    loadingDiagnoses: boolean;
    ready: boolean;
    error: string;
    loadScriptError: string;
    loadScreensError: string;
    configuration: Configuration;
    loadingConfiguration: boolean;
    loadConfigurationError: string;
    loadDiagnosesError: string;
    loadScreens: () => Promise<Screen[]>;
    loadScript: () => Promise<Script>;
    loadConfiguration: () => Promise<Configuration>;
    loadDiagnoses: () => Promise<Diagnosis[]>;
    loadData: () => Promise<LoadApiDataResults>;
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

export type UseScriptLogic = ApiData & {
    activeScreen: Screen;
    entries: Entry[];
    cachedEntries: Entry[];
    onBack: () => void;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'back') => { screen: Screen; index: number; };
    setEntry: (entry: Entry) => void;
    setCachedEntry: (entry: Entry) => void;
    getSuggestedDiagnoses: () => Diagnosis[]
};

export type ScriptContext = UseScriptLogic & {
    
}
