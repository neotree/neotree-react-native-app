import React from 'react';

export const Context = React.createContext(null);

export const useContext = () => React.useContext(Context);

export function setPageOptions(pageOptions = {}, inputs = []) {
  const { setState } = useContext();

  React.useEffect(() => {
    setState(prev => ({
      pageOptions: typeof pageOptions === 'function' ? pageOptions(prev) : pageOptions
    }));
  }, [...inputs]);

  React.useEffect(() => () => setState({ pageOptions: null }), []);
}

export default Context;
