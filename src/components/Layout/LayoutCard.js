import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';

import { useLayoutContext } from './Context';

const useStyles = makeStyles((theme, { layoutContext }) => ({
  root: {
    maxWidth: layoutContext.state.MAX_CONTENT_WIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '90%',
  }
}));

const LayoutCard = ({ children, style }) => {
  const layoutContext = useLayoutContext();
  const styles = useStyles({ layoutContext });

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

LayoutCard.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default LayoutCard;
