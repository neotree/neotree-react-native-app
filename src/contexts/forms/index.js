import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideFormsContext(Component) {
  return function formsContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
