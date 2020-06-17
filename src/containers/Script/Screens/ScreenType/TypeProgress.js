import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from 'native-base';

const Progress = ({ screen, context }) => {
  // const metadata = screen.data.metadata || {};
  //
  // React.useEffect(() => {
  //   context.setForm({ [screen.id]: true });
  // }, []);

  return (
    <>
      <View>
        <Text />
      </View>
    </>
  );
};

Progress.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default Progress;
