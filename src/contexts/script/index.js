import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useScriptContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideScriptContext(Component) {
  return function ScriptContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
