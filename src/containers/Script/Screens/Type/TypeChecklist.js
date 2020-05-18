import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';

const TypeChecklist = ({ screen, context }) => {
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

TypeChecklist.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default TypeChecklist;
