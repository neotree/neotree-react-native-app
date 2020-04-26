import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const PageRefresher = ({ onRefresh, children }) => {
  return (
    <>
      <View
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
          <Ionicons name="md-refresh" size={40} color="#ddd" />
        </Button>
      </View>
    </>
  );
};

PageRefresher.propTypes = {
  children: PropTypes.node,
  onRefresh: PropTypes.func,
};

export default PageRefresher;
