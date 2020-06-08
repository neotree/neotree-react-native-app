import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Section from './Section';

const useStyles = makeStyles(() => ({
  root: {},
}));

const Management = ({ screen, context }) => {
  const styles = useStyles();

  const metadata = screen.data.metadata || {};

  React.useEffect(() => {
    // context.setForm({
    //   [screen.id]: { key: metadata ? metadata.key : undefined, form: null }
    // });
  }, []);

  return (
    <>
      <View
        style={[styles.root]}
      >
        <Section
          title={metadata.title1}
          text={metadata.text1}
          image={metadata.image1}
        />

        <Section
          title={metadata.title2}
          text={metadata.text2}
          image={metadata.image2}
        />

        <Section
          title={metadata.title3}
          text={metadata.text3}
          image={metadata.image3}
        />
      </View>
    </>
  );
};

Management.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default Management;
