import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useHomeContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideHomeContext(Component) {
  return function HomeContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
