import { ScreenMetadataField } from '@/api/types';
import { Script, Screen, Configuration, Diagnosis, Application, DiagnosisData } from '@/api';
import { parseCondition } from './utils';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

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

export type EntryValueDiagnosis = Partial<DiagnosisData> & {
    how_agree?: string;
    hcw_follow_instructions?: string;
    hcw_reason_given?: string;
    isPrimaryProvisionalDiagnosis?: boolean;
    priority?: number;
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
    diagnosis?: EntryValueDiagnosis;
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
    shouldExit: boolean;
    exit: () => void;
    onBack: () => boolean;
    onNext: () => void;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'back') => { screen: Screen; index: number; };
    getSuggestedDiagnoses: () => Diagnosis[];
    getLastScreen: () => Screen;
    parseCondition: typeof parseCondition;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export type SetNavigationOptions = Partial<NativeStackNavigationOptions> & {
    onBack?: () => boolean;
    customTitle?: string;
    customSubtitle?: string;
};

export type ScreenOptions = {
    onBack?: () => boolean;
    scrollable?: boolean;
};

export type ScriptContext = UseScriptLogic & {
    setNavigationOptions(options?: SetNavigationOptions, screen?: Screen): void;
    screenOptions: ScreenOptions;
    setScreenOptions: React.Dispatch<React.SetStateAction<ScreenOptions>>;
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

export type ScreenDiagnosisComponentProps = ScreenComponentProps & {
    value: Entry;
    onDiagnosisChange: (entry: Partial<EntryValueDiagnosis>) => void;
    setSection: React.Dispatch<React.SetStateAction<string>>;
};
