import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideHomeContext(Component) {
  return function HomeContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
