import React from 'react';

export const SessionsContext = React.createContext(null);

export const useSessionsContext = () => React.useContext(SessionsContext);

export default SessionsContext;
