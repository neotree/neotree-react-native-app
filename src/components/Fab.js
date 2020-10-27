import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import theme from '@/native-base-theme/variables/commonColor';

const Fab = ({ style, ...props }) => {
  return (
    <>
      <TouchableOpacity
        {...props}
        style={[
          {
            backgroundColor: theme.brandInfo,
            height: 50,
            width: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 20,
            bottom: 20,
            elevation: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
          },
          ...(style && style.map ? style : [style]),
        ]}
      />
    </>
  );
};

Fab.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object,
  ]),
};

export default Fab;
