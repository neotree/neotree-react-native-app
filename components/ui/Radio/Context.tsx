import React from 'react';
import { IRadioContext } from './types';

export const RadioContext = React.createContext<IRadioContext>(null);

export const useRadioContext = () => React.useContext(RadioContext);
