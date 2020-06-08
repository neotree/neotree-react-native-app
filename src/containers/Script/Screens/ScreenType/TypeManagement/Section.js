import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Typography from '@/ui/Typography';
import makeStyles from '@/ui/styles/makeStyles';
import Image from '@/components/Image';

const useStyles = makeStyles(theme => ({
  root: {
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
      style={[styles.root]}
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

export default Section;
