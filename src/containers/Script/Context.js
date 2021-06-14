import React from 'react';

export const Context = React.createContext(null);

export const useContext = () => React.useContext(Context);

export const provideContext = Component => function ContextProvider(props) {
  const [state, _setState] = React.useState({
    script: null,
    screens: [],
    diagnoses: [],
    configuration: null,
    hideFloatingButton: false,
  });
  const setState = s => _setState(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

  return (
    <Context.Provider value={{ state, _setState, setState }}>
      <Component {...props} />
    </Context.Provider>
  );
};
