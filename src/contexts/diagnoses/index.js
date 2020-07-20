import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideDiagnosesContext(Component) {
  return function DiagnosesContextProvider(props) {
    const value = useContextValue(props);
    const { scriptId } = value.router.match.params;

    React.useEffect(() => { value.initialisePage(); }, [scriptId]);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
