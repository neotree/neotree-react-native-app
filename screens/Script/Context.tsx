import React from 'react';
import * as types from './types';

export const ScriptContext = React.createContext<types.ScriptContext>(null);

export const useScriptContext = () => React.useContext(ScriptContext);
