import React from 'react';
import { useDataContext } from '../../data';
import Value, { defaults } from './Value';

export default props => {
  const dataContext = useDataContext();
  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    setState,
    dataContext,
  });
};
