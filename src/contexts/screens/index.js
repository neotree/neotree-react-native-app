import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideScreensContext(Component) {
  return function ScreensContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
