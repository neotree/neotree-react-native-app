import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

const styles = {
  content: {
    width: '98%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 10,
  },
};

const ContentComponent = ({ style, containerProps, ...props }) => {
  containerProps = containerProps || {};

  return (
    <>
      <View
        {...containerProps}
        style={[
          styles.root,
          ...(containerProps.style ? containerProps.style.map ? containerProps.style : [containerProps.style] : [])
        ]}
      >
        <View
          style={[
            styles.content,
            ...(style ? style.map ? style : [style] : [])
          ]}
          {...props}
        />
      </View>
    </>
  );
};

ContentComponent.propTypes = {
  children: PropTypes.node,
  containerProps: PropTypes.object,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default ContentComponent;
