import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';
import { provideLayoutContext } from '../Context/Provider';
import Constants from 'expo-constants';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
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
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default provideLayoutContext(LayoutContainer);
