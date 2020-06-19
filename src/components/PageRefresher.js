import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import { Button, Icon, Content } from 'native-base';

const PageRefresher = ({ onRefresh, children }) => {
  return (
    <>
      <Content
        padder
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}

        <Divider border={false} />

        <Button
          onPress={onRefresh}
        >
          <Icon name="refresh" size={40} color="#ddd" />
        </Button>
      </Content>
    </>
  );
};

PageRefresher.propTypes = {
  children: PropTypes.node,
  onRefresh: PropTypes.func,
};

export default PageRefresher;
