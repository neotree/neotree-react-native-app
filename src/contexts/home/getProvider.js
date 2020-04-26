import React from 'react';
import { useCacheContext } from '@/contexts/cache';

export default Context => {
  return props => {
    const cacheContext = useCacheContext();

    const [state, _setState] = React.useState(cacheContext.state.homeState || {});

    const setState = s => _setState(
      typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
    );

    React.useEffect(() => {
      return () => cacheContext.setState({ homeState: state });
    }, [state]);

    return (
      <Context.Provider
        {...props}
        value={{
          state,
          setState,
        }}
      />
    );
  };
};
