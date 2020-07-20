import React from 'react';
import Context from './Context';
import { useDataContext } from '../data';
import ContextValue, { defaults } from './ContextValue';

export * from './Context';

export { default as useOverlayLoaderState } from './_useOverlayLoaderState';

export const provideAppContext = Component => function AppContextProvider(props) {
  const dataContext = useDataContext();

  const [state, setState] = React.useState(defaults.defaultState);
  const value = new ContextValue({
    props,
    state,
    setState,
    dataContext,
  });

  React.useEffect(() => value.loadFonts(), []);

  return (
    <Context.Provider
      value={value}
    >
      <Component {...props} />
    </Context.Provider>
  );
};
