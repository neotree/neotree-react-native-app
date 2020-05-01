import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideScriptContext(Component) {
  return function ScriptContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
