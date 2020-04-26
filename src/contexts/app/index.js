import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useAppContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideAppContext(Component) {
  return function AppContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
