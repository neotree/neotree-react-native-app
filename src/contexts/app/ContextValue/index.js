import React from 'react';
import { useNetworkContext } from '../../network';
import Value, { defaults } from './Value';

export default props => {
  const networkState = useNetworkContext();
  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    setState,
    networkState,
  });
};
