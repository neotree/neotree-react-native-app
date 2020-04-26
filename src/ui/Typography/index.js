import React from 'react';
import PropTypes from 'prop-types';

import { Text } from 'react-native';

import makeStyles from '../styles/makeStyles';
import styles from './styles';

const useStyles = makeStyles(styles);

const Typography = ({
  children,
  style,
  variant,
  color,
  ...props
}) => {
  const styles = useStyles({
    variant,
    color,
  });

  return (
    <>
      <Text
        {...props}
        style={[
          styles.root,
          styles[variant],
          styles[color],
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {children}
      </Text>
    </>
  );
};

Typography.propTypes = {
  variant: PropTypes.string,
  color: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Typography;
