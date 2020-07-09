import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideConfigKeysContext(Component) {
  return function ConfigKeysContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
