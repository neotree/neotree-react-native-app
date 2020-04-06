import React from 'react';
import PropTypes from 'prop-types';
import Context from './Context';

const ThemeProvider = props => {
  return (
    <>
      <Context.Provider
        {...props}
      />
    </>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node
};

export default ThemeProvider;
