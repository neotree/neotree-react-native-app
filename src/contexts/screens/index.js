import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useScreensContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideScreensContext(Component) {
  return function ScreensContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
