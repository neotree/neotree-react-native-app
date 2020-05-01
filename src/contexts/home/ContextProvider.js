import React from 'react';
import { useCacheContext } from '@/contexts/cache';
import Context from './Context';

export default function Provider(props) {
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
}
