import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';

import { View } from 'react-native';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
  }
}));

const LayoutBody = ({ children, style, ...props }) => {
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

LayoutBody.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default LayoutBody;
