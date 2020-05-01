import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideCacheContext(Component) {
  return function CacheContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
