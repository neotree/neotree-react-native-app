import React from 'react';
import PropTypes from 'prop-types';
import Overlay from '@/components/Overlay';
import { Spinner } from 'native-base';
import theme from '@/native-base-theme/variables/commonColor';

const OverlayLoader = ({ display, style, ...props }) => {
  if (!display) return null;

  return (
    <>
      <Overlay
        {...props}
        style={[
          { alignItems: 'center', justifyContent: 'center' },
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        <Spinner color={theme.brandInfo} />
      </Overlay>
    </>
  );
};

OverlayLoader.propTypes = {
  display: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default OverlayLoader;
