import React from 'react';
import { Screen, Script, getScript, getScreens, Configuration, getConfiguration, Diagnosis, getDiagnoses, Application, getApplication } from '@/api';
import { ApiData  } from '../types';

export function useApiData({ script_id }: { script_id: string | number }): ApiData {
    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState('');

    const [application, setApplication] = React.useState<Application>(null);
    const [loadingApplication, setLoadingApplication] = React.useState(true);
    const [loadApplicationError, setLoadApplicationError] = React.useState('');
    const loadApplication = React.useCallback(() => new Promise<Application>((resolve, reject) => {
        (async () => {
            setLoadingApplication(true);
            try {
                const application = await getApplication();
                resolve(application);
                setApplication(application);
            } catch (e) { 
                setLoadApplicationError(e.message); 
                reject(e); 
            }
            setLoadingApplication(false);
        })();
    }), []);

    const [script, setScript] = React.useState<Script>(null);
    const [loadingScript, setLoadingScript] = React.useState(true);
    const [loadScriptError, setLoadScriptError] = React.useState('');
    const loadScript = React.useCallback(() => new Promise<Script>((resolve, reject) => {
        (async () => {
            setLoadingScript(true);
            try {
                const script = await getScript({ script_id });
                resolve(script);
                setScript(script);
            } catch (e) { 
                setLoadScriptError(e.message); 
                reject(e); 
            }
            setLoadingScript(false);
        })();
    }), [script_id]);

    const [screens, setScreens] = React.useState<Screen[]>([]);
    const [loadingScreens, setLoadingScreens] = React.useState(true);
    const [loadScreensError, setLoadScreensError] = React.useState('');
    const loadScreens = React.useCallback(() => new Promise<Screen[]>((resolve, reject) => {
        (async () => {
            setLoadingScreens(true);
            try {
                const screens = await getScreens({ script_id: script_id as string });
                resolve(screens);
                setScreens(screens.filter(s => s.type === 'checklist'));
            } catch (e) { 
                setLoadScreensError(e.message); 
                reject(e); 
            }
            setLoadingScreens(false);
        })();
    }), [script_id]);

    const [diagnoses, setDiagnoses] = React.useState<Diagnosis[]>([]);
    const [loadingDiagnoses, setLoadingDiagnoses] = React.useState(true);
    const [loadDiagnosesError, setLoadDiagnosesError] = React.useState('');
    const loadDiagnoses = React.useCallback(() => new Promise<Diagnosis[]>((resolve, reject) => {
        (async () => {
            setLoadingDiagnoses(true);
            try {
                const diagnoses = await getDiagnoses({ script_id: script_id as string });
                resolve(diagnoses);
                setDiagnoses(diagnoses);
            } catch (e) { 
                setLoadDiagnosesError(e.message); 
                reject(e); 
            }
            setLoadingDiagnoses(false);
        })();
    }), [script_id]);

    const [configuration, setConfiguration] = React.useState<Configuration>(null);
    const [loadingConfiguration, setLoadingConfiguration] = React.useState(true);
    const [loadConfigurationError, setLoadConfigurationError] = React.useState('');
    const loadConfiguration = React.useCallback(() => new Promise<Configuration>((resolve, reject) => {
        (async () => {
            setLoadingConfiguration(true);
            try {
                const configuration = await getConfiguration();
                resolve(configuration);
                setConfiguration(configuration);
            } catch (e) { 
                setLoadConfigurationError(e.message); 
                reject(e); 
            }
            setLoadingConfiguration(false);
        })();
    }), []);

    const loadData: ApiData['loadData'] = React.useCallback(() => new Promise((resolve, reject) => {
        (async () => {
            setReady(false);
            setError('');
            try {
                const script = await loadScript();
                const screens = await loadScreens();
                const configuration = await loadConfiguration();
                const diagnoses = await loadDiagnoses();
                const application = await loadApplication();
                resolve({ script, screens, configuration, diagnoses, application });
            } catch (e) { 
                setError(e.message); 
                reject(e); 
            }
            setReady(true);
        })();
    }), [script_id]);

    React.useEffect(() => { loadData().then(() => {}).catch(e => {}); }, [script_id]);

    return {
        ready,
        script,
        screens,
        diagnoses,
        application,
        configuration,
        loadingScript,
        loadingScreens,
        loadingConfiguration,
        loadDiagnosesError,
        loadingApplication,
        loadingDiagnoses,
        error,
        loadScriptError,
        loadScreensError,
        loadConfigurationError,
        loadApplicationError,
        loadScreens,
        loadScript,
        loadConfiguration,
        loadDiagnoses,
        loadData,
        loadApplication,
    };
}
