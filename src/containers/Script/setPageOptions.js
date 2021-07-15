import React from 'react';
import { useContext } from './Context';

export default function setPageOptions(pageOptions = {}, inputs = []) {
  const { setState } = useContext();

  React.useEffect(() => {
    setState(prev => ({
      pageOptions: typeof pageOptions === 'function' ? pageOptions(prev) : pageOptions
    }));
  }, [...inputs]);

  React.useEffect(() => () => setState({ pageOptions: null }), []);
}
