import React from 'react';

export const Context = React.createContext(null);

export function useScreensContext() {
  return React.useContext(Context);
}

export default Context;
