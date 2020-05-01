import React from 'react';

export const Context = React.createContext(null);

export function useScriptContext() {
  return React.useContext(Context);
}

export default Context;
