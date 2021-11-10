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

export type Entry = {

};

export type UseScriptLogic = ApiData & {
    activeScreen: Screen;
    entries: Entry[];
    cachedEntries: Entry[];
    onBack: () => void;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'prev') => Screen;
    setEntry: (entry: Entry) => void;
    setCachedEntry: (entry: Entry) => void;
};

export type ScriptContext = UseScriptLogic & {
    
}
