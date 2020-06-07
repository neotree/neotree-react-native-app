import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const Progress = ({ screen, context }) => {
  const metadata = screen.data.metadata || {};

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

Progress.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default Progress;
