import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideNetworkContext(Component) {
  return function NetworkContextProvider(props) {
    const value = useContextValue(props);

    React.useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(s => value.setState(s));
      return () => unsubscribe();
    }, []);

    return (
      <Context.Provider value={value.state}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
