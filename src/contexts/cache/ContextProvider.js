import React from 'react';
import Context from './Context';

export default function Provider(props) {
  const [state, _setState] = React.useState({});

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
      }}
    />
  );
}
