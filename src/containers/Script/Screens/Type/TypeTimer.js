import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Timer = ({ screen, context }) => {
  const { metadata } = screen.data;

  React.useEffect(() => {
    context.setForm({ [screen.id]: true });
  }, []);

  return (
    <>
      <View>
        <Typography />
      </View>
    </>
  );
};

Timer.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default Timer;
