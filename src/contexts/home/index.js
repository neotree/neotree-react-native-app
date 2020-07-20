import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideHomeContext(Component) {
  return function HomeContextProvider(props) {
    const value = useContextValue(props);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
