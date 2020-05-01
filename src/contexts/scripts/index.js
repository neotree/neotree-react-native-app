import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideScriptsContext(Component) {
  return function ScriptsContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
