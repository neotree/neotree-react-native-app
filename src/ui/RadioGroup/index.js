import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';
import { provideRadioGroupContext } from './Context';

const useStyles = makeStyles(() => ({
  root: {}
}));

const RadioGroup = ({
  style,
  children,
  value,
  onChange,
  name,
  ...props
}) => {
  const styles = useStyles();

  return (
    <View
      {...props}
      style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
    >
      {children}
    </View>
  );
};

RadioGroup.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default provideRadioGroupContext(RadioGroup);
