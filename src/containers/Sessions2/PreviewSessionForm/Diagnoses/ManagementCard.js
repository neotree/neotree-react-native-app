import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import { Card, CardItem } from 'native-base';
import Image from '@/components/Image';

const ManagementCard = ({ text, image }) => {
  if (!(text || image)) return null;

  return (
    <>
      <Card>
        {!!text && <CardItem><Text>{text}</Text></CardItem>}
        {!!image && (
          <Image
            fullWidth
            resizeMode="contain"
            source={{ uri: image.data }}
          />
        )}
      </Card>
      {!!(text || image) && <Divider border={false} />}
    </>
  );
};

ManagementCard.propTypes = {
  text: PropTypes.string,
  image: PropTypes.object,
};

export default ManagementCard;
