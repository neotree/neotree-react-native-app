import React from 'react';

export const Context = React.useContext(null);

export const useButtonContext = () => React.useContext(Context);

export const Provider = ({ children, ...props }) => {
  return (
    <Context.Provider
      value={{ props }}
    >
      {children}
    </Context.Provider>
  );
};

export function provideButtonContext(Component) {
  return function ContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  }
}
