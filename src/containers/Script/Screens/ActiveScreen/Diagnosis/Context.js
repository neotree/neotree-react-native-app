import React from 'react';

export const DiagnosisContext = React.createContext(null);

export const useDiagnosisContext = () => React.useContext(DiagnosisContext);
