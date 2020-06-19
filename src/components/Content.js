import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Content } from 'native-base';

const styles = {
  root: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
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
        <Content
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
