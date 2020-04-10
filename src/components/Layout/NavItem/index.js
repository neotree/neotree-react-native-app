import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import { Ionicons } from '@expo/vector-icons';

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
  },
  icon: {
    fontSize: 25,
    color: props.active ? theme.palette[props.color || 'primary'].main : theme.palette.text.primary
  }
}));

const LayoutNavItem = ({ children, style, active, color, label, icon, ...props }) => {
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
          {icon ? <Ionicons name={icon} style={styles.icon}/> : null}
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
  icon: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
};

export default LayoutNavItem;
