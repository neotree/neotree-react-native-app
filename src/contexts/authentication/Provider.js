import React from 'react';
import PropTypes from 'prop-types';

import Context from '.';

const ContextProvider = props => {
  const [state, _setState] = React.useState({
    form: {
      email: '',
      password: '',
    }
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const setForm = s => _setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...s }
  }));

  return (
    <>
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
          setForm,
        }}
      />
    </>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node
};

export function provideAuthenticationContext(Component) {
  return function Provider(props) {
    return (
      <ContextProvider {...props}>
        <Component {...props} />
      </ContextProvider>
    );
  };
}

export default ContextProvider;
