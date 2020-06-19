import React from 'react';
import PropTypes from 'prop-types';
import Overlay from '@/components/Overlay';
import { Content } from 'native-base';

const Container = ({ children }) => {
  return (
    <>
      <Overlay color="#fff">
        <Content padder>
          {children}
        </Content>
      </Overlay>
    </>
  );
};

Container.propTypes = {
  children: PropTypes.node
};

export default Container;
