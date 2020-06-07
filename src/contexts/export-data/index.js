import React from 'react';
import Provider from './ContextProvider';

export * from './Context';

export { Provider };

export function provideExportDataContext(Component) {
  return function ExportDataContextProvider(props) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  };
}
