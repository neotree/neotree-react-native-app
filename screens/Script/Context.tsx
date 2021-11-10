import React from 'react';
import { Script, Screen } from '@/api';

export interface IScriptContext {
    script: Script;
    screens: Screen[];
    activeScreen?: Screen;
    navigateToScreen: (screen_id: string | number) => void;
    getScreen: (nextOrPrev: 'next' | 'prev') => Screen;
}

export const ScriptContext = React.createContext<IScriptContext>(null);

export const useScriptContext = () => React.useContext(ScriptContext);
