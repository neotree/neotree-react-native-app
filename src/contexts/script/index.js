import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideScriptContext(Component) {
  return function ScriptContextProvider(props) {
    const value = useContextValue(props);
    const { match: { params: { scriptId } } } = value.router;

    React.useEffect(() => { value.initialiseScript(); }, [scriptId]);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
