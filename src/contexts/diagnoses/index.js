import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideDiagnosesContext(Component) {
  return function DiagnosesContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
