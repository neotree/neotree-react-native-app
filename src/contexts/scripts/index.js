import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';

export * from './Context';

export function provideScriptsContext(Component) {
  return function ScriptsContextProvider(props) {
    const value = useContextValue(props);
    const { match: { params: { scriptId } } } = value.router;

    React.useEffect(() => { value.initialisePage(); }, [scriptId]);

    useDataRefresherAfterSync('scripts', () => {
      value.getScripts(null, { showLoader: false });
    });

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
