import React from 'react';
import PropTypes from 'prop-types';

export const Context = React.createContext(null);

export const useRadioGroupContext = () => React.useContext(Context);

export function provideRadioGroupContext(Component) {
  function ContextProvider(props) {
    return (
      <Context.Provider
        value={{
          selected: props.value,
          onChange: props.onChange,
          color: props.color
        }}
      >
        <Component {...props} />
      </Context.Provider>
    );
  }

  ContextProvider.propTypes = {
    value: PropTypes.string,
    selected: PropTypes.string,
    onChange: PropTypes.func,
    color: PropTypes.string,
  };

  return ContextProvider;
}
