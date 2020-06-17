import React from 'react';
import PropTypes from 'prop-types';
import Image from '@/components/Image';
import { Card, CardItem, Text } from 'native-base';

const Section = ({ title, text, image }) => {
  if (!(title || text || image)) return null;

  return (
    <Card>
      {!title ? null : (
        <CardItem>
          <Text style={{ fontWeight: 'bold' }}>{title}</Text>
        </CardItem>
      )}
      {!text ? null : (
        <CardItem>
          <Text>{text}</Text>
        </CardItem>
      )}
      {!image ? null : (
        <Image
          fullWidth
          resizeMode="contain"
          source={{ uri: image.data }}
        />
      )}
    </Card>
  );
};

Section.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  image: PropTypes.object,
};

export default Section;
