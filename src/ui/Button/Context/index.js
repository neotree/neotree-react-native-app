import React from 'react';

export const Context = React.useContext(null);

export const useButtonContext = () => React.useContext(Context);

export const Provider = props => {
  return (
    <Context.Provider
      {...props}
      value={{ props }}
    />
  );
};

export function provideButtonContext(Component) {
  return function ContextProvider(props) {
    return (
      <Provider {...props}>
        <Component {...props} />
      </Provider>
    );
  };
}
