import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';
import useDataRefresherAfterSync from '../useDataRefresherAfterSync';

export * from './Context';

export function provideConfigKeysContext(Component) {
  return function ConfigKeysContextProvider(props) {
    const value = useContextValue(props);

    React.useEffect(() => {
      value.getConfiguration();
      value.getConfigKeys();
    }, []);

    useDataRefresherAfterSync('configKeys', () => {
      value.getConfigKeys(null, { showLoader: false });
    });

    useDataRefresherAfterSync('app_data_sync', () => {
      value.getConfigKeys(null, { showLoader: false });
    });

    console.log(Object.keys(value.state));

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
