import React from 'react';
import PropTypes from 'prop-types';
import * as NativeBase from 'native-base';
import { Modal, TouchableOpacity, View } from 'react-native';

function DisplayError({ onRefresh, error }) {
  if (!error) return null;

  return (
    <Modal visible>
      <NativeBase.Content
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <NativeBase.Text style={{ color: '#b20008' }}>{error}</NativeBase.Text>

        <View style={{ marginVertical: 10 }} />

        {!!onRefresh && (
          <NativeBase.Button
            transparent
            onPress={() => onRefresh()}
            component={TouchableOpacity}
          >
            <NativeBase.Icon style={{ fontSize: 80, color: theme.palette.disabled }} name="refresh" />
          </NativeBase.Button>
        )}
      </NativeBase.Content>
    </Modal>
  );
}

DisplayError.propTypes = {
  onRefresh: PropTypes.func,
  error: PropTypes.string,
};

export default DisplayError;
