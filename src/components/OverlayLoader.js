import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'native-base';
import theme from '~/native-base-theme/variables/commonColor';
import { Modal, View, } from 'react-native';

const OverlayLoader = ({ display, style, transparent, ...props }) => {
  if (!display) return null;

  return (
    <Modal open transparent>
      <View
        {...props}
        style={[
          { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: `rgba(0,0,0,${transparent ? 0 : 0.5})`, },
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        <Spinner color={theme.brandInfo} />
      </View>
    </Modal>
  );
};

OverlayLoader.propTypes = {
  display: PropTypes.bool,
  transparent: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default OverlayLoader;
