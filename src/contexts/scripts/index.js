import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useScriptsContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideScriptsContext(Component) {
  return function ScriptsContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
