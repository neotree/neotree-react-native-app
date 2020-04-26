import React from 'react';
import getProvider from './getProvider';

export const Context = React.createContext(null);

export function useCacheContext() {
  return React.useContext(Context);
}

export const Provider = getProvider(Context);

export function provideCacheContext(Component) {
  return function CacheContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}

export default Context;
