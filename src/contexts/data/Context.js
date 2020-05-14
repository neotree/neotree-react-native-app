import React from 'react';

export const Context = React.createContext(null);

export function useDataContext() {
  return React.useContext(Context);
}

export default Context;
