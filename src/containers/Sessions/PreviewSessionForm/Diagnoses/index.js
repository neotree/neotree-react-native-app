import React from 'react';
import PropTypes from 'prop-types';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import ManagementCard from './ManagementCard';

const Diagnoses = ({ session: { data: { diagnoses } } }) => {
  diagnoses = diagnoses || [];

  if (!diagnoses.length) return null;

  return (
    <>
      <Text variant="h3">Diagnoses</Text>
      <Divider border={false} />

      {diagnoses.map(d => {
        return (
          <React.Fragment key={`diagnosis-${d.id}`}>
            <Text>- {d.data.name}</Text>
            <Divider border={false} spacing={2} />
          </React.Fragment>
        );
      })}

      <Text variant="h3">Management</Text>
      <Divider border={false} />

      {diagnoses.map(d => {
        return (
          <React.Fragment key={`mgt-${d.id}`}>
            <ManagementCard
              text={d.data.text1}
              image={d.data.image1}
            />

            <ManagementCard
              text={d.data.text2}
              image={d.data.image2}
            />

            <ManagementCard
              text={d.data.text3}
              image={d.data.image3}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

Diagnoses.propTypes = {
  session: PropTypes.object.isRequired,
};

export default Diagnoses;
