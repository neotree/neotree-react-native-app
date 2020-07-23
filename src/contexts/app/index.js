import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export { default as useOverlayLoaderState } from './_useOverlayLoaderState';

export const provideAppContext = Component => function AppContextProvider(props) {
  const value = useContextValue(props);

  React.useEffect(() => value.loadFonts(), []);

  return (
    <Context.Provider
      value={value}
    >
      <Component {...props} />
    </Context.Provider>
  );
};
