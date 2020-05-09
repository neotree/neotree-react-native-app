import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '../styles/makeStyles';
import IconComponent from '../Icon';
import Button from '../Button';

const useStyles = makeStyles(() => {
  const size = 50;

  return {
    root: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    icon: {},
  };
});

const IconButton = ({ style, icon, children, size, ...props }) => {
  size = size || 25;

  const styles = useStyles({ size });

  return (
    <>
      <Button
        {...props}
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {({ styles }) => {
          return (
            <>
              {!icon ? null : (
                <IconComponent
                  name={icon}
                  size={size}
                  style={[styles.icon, { color: styles.text.color }]}
                />
              )}
              {children}
            </>
          );
        }}
      </Button>
    </>
  );
};

IconButton.propTypes = {
  size: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default IconButton;
