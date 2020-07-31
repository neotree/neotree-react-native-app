import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export { default as useOverlayLoaderState } from './_useOverlayLoaderState';

export const provideAppContext = Component => function AppContextProvider(props) {
  const value = useContextValue(props);
  const { sync, setState, state: { authenticatedUser, networkState, } } = value;

  React.useEffect(() => value.initialiseApp(), []);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(s => setState({
      networkState: s,
      networkStateInitialised: true, 
    }));
    return () => unsubscribe();
  }, []);

  React.useEffect(() => { if (authenticatedUser) sync(); }, [networkState]);

  return (
    <Context.Provider
      value={value}
    >
      <Component {...props} />
    </Context.Provider>
  );
};
