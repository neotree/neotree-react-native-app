import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import makeStyles from '@/ui/styles/makeStyles';
import Image from '@/components/Image';

const useStyles = makeStyles(theme => ({
  root: {},
  section: {
    marginVertical: theme.spacing(),
    padding: theme.spacing(),
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sectionImage: {
    marginVertical: theme.spacing(),
  }
}));

const Section = ({ title, text, image }) => {
  const styles = useStyles();

  if (!(title || text || image)) return null;

  return (
    <View
      style={[styles.section]}
    >
      {!title ? null : <Typography variant="h4">{title}</Typography>}
      {!text ? null : <Typography>{text}</Typography>}
      {!image ? null : (
        <Image
          fullWidth
          resizeMode="contain"
          source={{ uri: image.data }}
          style={[styles.sectionImage]}
        />
      )}
    </View>
  );
};

Section.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  image: PropTypes.object,
};

const Management = ({ screen, context }) => {
  const styles = useStyles();

  const { metadata } = screen.data;

  React.useEffect(() => {
    context.setForm({ [screen.id]: true });
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
