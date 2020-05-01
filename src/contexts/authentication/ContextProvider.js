import React from 'react';
import Context from './Context';

export default function Provider(props) {
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
}
