import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideDataContext(Component) {
  return function DataContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
