import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';

import { TouchableOpacity } from 'react-native';

const useStyles = makeStyles((theme, props) => ({
  root: {
    padding: theme.spacing(),
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 5,
    borderColor: props.active ? theme.palette[props.color || 'primary'].main : 'transparent'
  }
}));

const LayoutNavItem = ({ children, style, active, color, label, ...props }) => {
  color = color || 'primary';

  const styles = useStyles({ active, color });

  return (
    <>
      <TouchableOpacity
        {...props}
        disabled={props.disabled || active}
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        <>
          {children}
          {!label ? null : (
            <Typography
              variant="caption"
              {...active ? { color } : null}
            >
              {label}
            </Typography>
          )}
        </>
      </TouchableOpacity>
    </>
  );
};

LayoutNavItem.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
};

export default LayoutNavItem;
