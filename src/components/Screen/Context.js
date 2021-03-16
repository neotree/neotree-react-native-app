import React from 'react';

export const ScreenContext = React.createContext(null);

export const useScreenContext = () => React.useContext(ScreenContext);
