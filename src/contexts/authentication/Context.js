import React from 'react';

export const Context = React.createContext(null);

export function useAuthenticationContext() {
  return React.useContext(Context);
}

export default Context;