import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import { ScreenContext } from './Context';

export * from './Context';

const Screen = (props) => {
  const { children, headerOptions: headerOptionsProps } = props;
  const [state, _setState] = React.useState({});
  const setState = s => _setState(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

  const headerOptions = state.headerOptions || headerOptionsProps;

  return (
    <ScreenContext.Provider
      value={{
        props,
        headerOptions,
        set: (key, value) => setState(s => ({
          [key]: typeof value === 'function' ? value(s[key]) : value,
        }))
      }}
    >
      {!!headerOptions && <Header />}

      {children}
    </ScreenContext.Provider>
  );
};

Screen.propTypes = {
  children: PropTypes.node,
  headerOptions: PropTypes.shape({

  })
};

export default Screen;
