import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';
import constants from '@/constants';

const Logo = () => {
  return (
    <>
      <Text>{constants.APP_TITLE}</Text>
    </>
  );
};

Logo.propTypes = {};

export default Logo;
