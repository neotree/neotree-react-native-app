import React from 'react';
import PropTypes from 'prop-types';
import { provideLayoutContext } from '@/contexts/layout/Provider';
import makeStyles from '@/ui/styles/makeStyles';

import { View } from 'react-native';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  }
}));

const LayoutContainer = ({ children, style, ...props }) => {
  const styles = useStyles();

  return (
    <>
      <View
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {children}
      </View>
    </>
  );
};

LayoutContainer.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
};

export default provideLayoutContext(LayoutContainer);
