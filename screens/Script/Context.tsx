import React from 'react';
import { ScriptData, ScreenData } from '@/api';

export interface IScriptContext {
    script: ScriptData;
    screens: ScreenData[];
    activeScreen?: ScreenData;
}

export const ScriptContext = React.createContext<IScriptContext>(null);

export const useScriptContext = () => React.useContext(ScriptContext);
