import React from 'react';
import PropTypes from 'prop-types';
import Overlay from '@/ui/Overlay';
import ActivityIndicator from '@/ui/ActivityIndicator';

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
        <ActivityIndicator size="large" />
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
