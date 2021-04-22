import React from 'react';
import PropTypes from 'prop-types';
import { H3 } from 'native-base';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import ManagementCard from './ManagementCard';

export default function Diagnosis({
  diagnosis
}) {
  return (
    <>
      <H3>{diagnosis.name}</H3>

      <Divider border={false} spacing={2} />

      <ManagementCard
        text={diagnosis.text1}
        image={diagnosis.image1}
      />

      <ManagementCard
        text={diagnosis.text2}
        image={diagnosis.image2}
      />

      <ManagementCard
        text={diagnosis.text3}
        image={diagnosis.image3}
      />
    </>
  );
}

Diagnosis.propTypes = {
  diagnosis: PropTypes.object.isRequired
};
