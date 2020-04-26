import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';
import LayoutCard from '../LayoutCard';
import { useLayoutContext } from '../Context';

const useStyles = makeStyles((theme, { placement }) => ({
  root: {
    borderColor: '#ddd',
    alignItems: 'center',
    ...placement === 'bottom' ? {
      borderTopWidth: 1,
    } : {
      borderBottomWidth: 1
    },
  },
  rootInner: {
    flexDirection: 'row',
  }
}));

const LayoutNavigation = ({ children, style, placement }) => {
  const layoutContext = useLayoutContext();
  const styles = useStyles({ placement, layoutContext });

  return (
    <>
      <View
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        <LayoutCard
          style={[styles.rootInner]}
        >
          {children}
        </LayoutCard>
      </View>
    </>
  );
};

LayoutNavigation.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  placement: PropTypes.oneOf(['top', 'bottom'])
};

export default LayoutNavigation;
