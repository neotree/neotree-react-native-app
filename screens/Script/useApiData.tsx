import React from 'react';
import { ScreenData, ScriptData, getScript, getScreens } from '@/api';

export type UseApiData = [
    {
        script: ScriptData;
        screens: ScreenData[];
        loadingScript: boolean;
        loadingScreens: boolean;
        loadScreens: () => Promise<ScreenData[]>;
        loadScript: () => Promise<ScriptData>;
        ready: boolean;
        error: string,
        loadScriptError: string,
        loadScreensError: string,
    },
    () => Promise<{ screens: ScreenData[]; script: ScriptData; }>
]

export function useApiData({ script_id }: { script_id: string | number }): UseApiData {
    const [ready, setReady] = React.useState(false);
    const [error, setError] = React.useState('');

    const [script, setScript] = React.useState<ScriptData>(null);
    const [loadingScript, setLoadingScript] = React.useState(true);
    const [loadScriptError, setLoadScriptError] = React.useState('');
    const loadScript = React.useCallback(() => new Promise<ScriptData>((resolve, reject) => {
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

    const [screens, setScreens] = React.useState<ScreenData[]>([]);
    const [loadingScreens, setLoadingScreens] = React.useState(true);
    const [loadScreensError, setLoadScreensError] = React.useState('');
    const loadScreens = React.useCallback(() => new Promise<ScreenData[]>((resolve, reject) => {
        (async () => {
            setLoadingScreens(true);
            try {
                const screens = await getScreens({ script_id: script_id as string });
                resolve(screens);
                setScreens(screens);
            } catch (e) { 
                setLoadScreensError(e.message); 
                reject(e); 
            }
            setLoadingScreens(false);
        })();
    }), [script_id]);

    const loadData = React.useCallback(() => new Promise<{ screens: ScreenData[]; script: ScriptData; }>((resolve, reject) => {
        (async () => {
            setReady(false);
            setError('');
            try {
                const script = await loadScript();
                const screens = await loadScreens();
                resolve({ script, screens, });
            } catch (e) { 
                setError(e.message); 
                reject(e); 
            }
            setReady(true);
        })();
    }), [script_id]);

    React.useEffect(() => { loadData().then(() => {}).catch(e => {}); }, [script_id]);

    return [{
        ready,
        script,
        screens,
        loadingScript,
        loadingScreens,
        error,
        loadScriptError,
        loadScreensError,
        loadScreens,
        loadScript,
    }, loadData];
}
