import React from 'react';
import PropTypes from 'prop-types';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import ManagementCard from './ManagementCard';

const Diagnoses = ({ Wrapper, session: { data: { diagnoses } } }) => {
  Wrapper = Wrapper || React.Fragment;
  diagnoses = diagnoses || [];

  if (!diagnoses.length) return null;

  return (
    <>
      <Wrapper>
        <Text variant="h3">Diagnoses</Text>
        <Divider border={false} />

        {diagnoses.filter(d => d.how_agree === 'Yes').map(d => {
          return (
            <React.Fragment key={`diagnosis-${d.id}`}>
              <Text>- {d.name}</Text>
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
                text={d.text1}
                image={d.image1}
              />

              <ManagementCard
                text={d.text2}
                image={d.image2}
              />

              <ManagementCard
                text={d.text3}
                image={d.image3}
              />
            </React.Fragment>
          );
        })}
      </Wrapper>
    </>
  );
};

Diagnoses.propTypes = {
  session: PropTypes.object.isRequired,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default Diagnoses;
