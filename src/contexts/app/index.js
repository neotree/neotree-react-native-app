import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { default as useOverlayLoaderState } from './_useOverlayLoaderState';

export { Provider };

export function provideAppContext(Component) {
  return function AppContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
