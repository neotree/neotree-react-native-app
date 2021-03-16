import React from 'react';
import PropTypes from 'prop-types';
import { Item } from 'native-base';

const ItemComponent = React.forwardRef(({
  disabled,
  enabled,
  regular,
  style,
  ...props
}, ref) => {
  return (
    <>
      <Item
        regular={regular === undefined ? true : regular}
        ref={ref}
        {...props}
        style={[
          (disabled || (enabled === false)) ? { borderColor: '#ddd', backgroundColor: '#ddd' } : {},
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
});

ItemComponent.propTypes = {
  disabled: PropTypes.bool,
  enabled: PropTypes.bool,
  regular: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default ItemComponent;
