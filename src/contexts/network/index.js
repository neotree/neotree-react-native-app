import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideNetworkContext(Component) {
  return function NetworkContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
