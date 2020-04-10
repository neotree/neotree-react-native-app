import React from 'react';
import PropTypes from 'prop-types';

import Context from '.';

const ContextProvider = props => {
  const [state, _setState] = React.useState({});

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  return (
    <>
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
        }}
      />
    </>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node
};

export function provideLayoutContext(Component) {
  return function Provider(props) {
    return (
      <ContextProvider {...props}>
        <Component {...props} />
      </ContextProvider>
    );
  };
}

export default ContextProvider;
