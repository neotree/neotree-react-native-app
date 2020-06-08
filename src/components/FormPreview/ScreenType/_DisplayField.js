import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import { View } from 'react-native';

const DisplayField = ({ values, label }) => {
  values = values || [];
  if (!values.map) values = [values];

  return (
    <>
      <View>
        <Typography>{label}</Typography>
        {(values || []).map((v) => {
          return (
            <Typography variant="textSecondary">{v.text}</Typography>
          );
        })}
        <Divider spacing={2} />
      </View>
    </>
  );
};

DisplayField.propTypes = {
  label: PropTypes.string,
  values: PropTypes.arrayOf([PropTypes.shape({
    text: PropTypes.string,
    key: PropTypes.any
  })])
};

export default DisplayField;
