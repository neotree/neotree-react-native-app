import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideSessionsContext(Component) {
  return function sessionsContextProvider(props) {
    const value = useContextValue();

    React.useEffect(() => { value.getSessions(); }, []);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
