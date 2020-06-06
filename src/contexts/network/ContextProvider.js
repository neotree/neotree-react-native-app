import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';

function Provider(props) {
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(s => setState(s));
    return () => unsubscribe();
  }, []);

  return (
    <Context.Provider
      {...props}
      value={state}
    />
  );
}

export default Provider;
