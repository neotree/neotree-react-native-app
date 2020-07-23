import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export const provideDataContext = Component => {
  return function DataContextProvider(props) {
    const value = useContextValue(props);
    const { sync, networkState, state: { authenticatedUser } } = value;

    React.useEffect(() => {
      value.initialiseData();
      value.addSocketEventsListeners();
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
};
