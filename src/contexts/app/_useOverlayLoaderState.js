import React from 'react';
import { useAppContext } from './Context';

export default (key, value) => {
  const { setState } = useAppContext();

  React.useEffect(() => {
    const set = (key, value) => setState(prevState => ({
      ...prevState,
      overlayLoaderState: { ...prevState.overlayLoaderState, [key]: value }
    }));

    set(key, value);

    return () => set(key, false);
  }, [key, value]);
};
