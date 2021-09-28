import React from 'react';
import * as types from '@/types';

export const AppContext = React.createContext<types.AppContext | null>(null);

export const useAppContext = () => React.useContext(AppContext);
