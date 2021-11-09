import React from 'react';
import { ScriptData, ScreenData } from '@/api';

export interface IScriptContext {
    script: ScriptData;
    screens: ScreenData[];
    activeScreen?: ScreenData;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'prev') => ScreenData;
}

export const ScriptContext = React.createContext<IScriptContext>(null);

export const useScriptContext = () => React.useContext(ScriptContext);
