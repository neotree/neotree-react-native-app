import React from 'react';
import { useLayoutContext } from '.';

export default (opts = {}) => {
  const { setState } = useLayoutContext();
  React.useEffect(() => {
    if (opts.hide) setState({ hideNav: true });
    return () => setState({ hideNav: false });
  }, []);
};
