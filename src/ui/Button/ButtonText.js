import React from 'react';
import PropTypes from 'prop-types';
import { useButtonContext } from './Context';

const ButtonText = ({ children }) => {
  const btnContext = useButtonContext();

  return (
    <Text>
      {children}
    </Text>
  );
};

ButtonText.propTypes = {
  children: PropTypes.node
};

export default ButtonText;
