import React from 'react';
import PropTypes from 'prop-types';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';

function Provider({ children }) {
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(s => setState(s));
    return () => unsubscribe();
  }, []);

  return (
    <Context.Provider
      value={state}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};

export default Provider;
