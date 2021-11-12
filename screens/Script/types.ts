import { ScreenMetadataField } from '@/api/types';
import { Script, Screen, Configuration, Diagnosis, Application } from '@/api';
import { parseCondition } from './utils';

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

export type EntryValue = {
    value: any;
    exportValue?: any;
    confidential?: any;
    valueText?: string;
    key: string;
    label?: string;
    type?: string;
    dataType?: string;
    exclusive?: boolean;
    error?: any;
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
    autoFill?: boolean;
};

export type AutoFill = {
    uid: string;
    session?: any;
};

export type UseEntriesLogic = {
    activeScreenEntry: Entry;
    activeScreenCachedEntry: Entry;
    entries: Entry[];
    cachedEntries: Entry[];
    screensWithNoAutoFill: { [screenId: string | number ]: boolean; };
    autoFill: AutoFill;
    setEntry: (entry: Entry) => void;
    setCachedEntry: (entry: Entry) => void;
    setAutoFill: React.Dispatch<React.SetStateAction<AutoFill>>;
    removeEntry: (screenId: number | string) => void;
};

export type UseScriptLogic = ApiData & UseEntriesLogic & {
    refresh: boolean;
    activeScreen: Screen;
    onBack: () => void;
    onNext: () => void;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'back') => { screen: Screen; index: number; };
    getSuggestedDiagnoses: () => Diagnosis[];
    getLastScreen: () => Screen;
    parseCondition: typeof parseCondition;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ScriptContext = UseScriptLogic & {
    
}

export type ScreenComponentProps = {
    setEntry: (entry?: Partial<Entry>) => void;
    canAutoFill: boolean;
};

export type ScreenFormFieldComponentProps = ScreenComponentProps & {
    field: ScreenMetadataField;
    conditionMet: boolean;
    value: any;
    valueObject: EntryValue;
    form: Entry;
    onChange: (value: any, params?: any) => void;
};
