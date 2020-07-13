import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideSessionsContext(Component) {
  return function sessionsContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
