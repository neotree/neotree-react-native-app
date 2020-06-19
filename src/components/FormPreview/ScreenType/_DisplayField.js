import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import { View } from 'react-native';
import { Text } from 'native-base';

const DisplayField = ({ values, label }) => {
  values = values || [];
  if (!values.map) values = [values];

  return (
    <>
      <View>
        <Text>{label}</Text>
        {(values || []).map((v) => {
          return (
            <Text style={{ color: '#999' }}>{v.text}</Text>
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
