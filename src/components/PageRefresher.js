import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { LayoutCard } from '@/components/Layout';

const PageRefresher = ({ onRefresh, children }) => {
  return (
    <>
      <LayoutCard
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
      </LayoutCard>
    </>
  );
};

PageRefresher.propTypes = {
  children: PropTypes.node,
  onRefresh: PropTypes.func,
};

export default PageRefresher;
