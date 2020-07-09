import React from 'react';
import PropTypes from 'prop-types';
import Context from './Context';

export default function Provider({ children }) {
  const [state, _setState] = React.useState({});

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  return (
    <Context.Provider
      value={{
        state,
        setState,
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};
