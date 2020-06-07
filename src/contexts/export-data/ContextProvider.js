import React from 'react';
import Context from './Context';
import _getData from './_getData';

function Provider(props) {
  const [state, _setState] = React.useState({
    data: [],
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const getData = _getData({ state, setState });

  React.useEffect(() => { getData(); }, []);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        getData,
      }}
    />
  );
}

export default Provider;
