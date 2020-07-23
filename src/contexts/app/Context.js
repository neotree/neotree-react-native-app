import React from 'react';

export const Context = React.createContext(null);

export const useAppContext = () => React.useContext(Context);

export default Context;
