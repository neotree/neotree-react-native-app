import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';

import { View } from 'react-native';

const useStyles = makeStyles((theme, props) => ({
  root: {
    flexDirection: 'row',
    borderColor: '#ddd',
    height: 60,
    alignItems: 'center',
    ...props.placement === 'bottom' ? {
      borderTopWidth: 1,
    } : {
      borderBottomWidth: 1
    },
  }
}));

const LayoutNavigation = ({ children, style, placement, ...props }) => {
  const styles = useStyles({ placement });

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

LayoutNavigation.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
  placement: PropTypes.oneOf(['top', 'bottom'])
};

export default LayoutNavigation;
