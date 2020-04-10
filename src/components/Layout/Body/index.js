import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';

import { ScrollView } from 'react-native';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
  }
}));

const LayoutBody = ({ children, style, ...props }) => {
  const styles = useStyles();

  return (
    <>
      <ScrollView
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {children}
      </ScrollView>
    </>
  );
};

LayoutBody.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
};

export default LayoutBody;
