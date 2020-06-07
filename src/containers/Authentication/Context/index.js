import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideAuthenticationContext(Component) {
  return function AuthenticationContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
