import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { Tabs, Tab } from 'native-base';
import Form from './Form';
import Diagnoses from './Diagnoses';

const PreviewSessionForm = ({ Wrapper, scrollable, ...props }) => {
  scrollable = scrollable !== false;
  Wrapper = Wrapper || React.Fragment;
  const RootComponent = scrollable ? ScrollView : React.Fragment;

  return (
    <>
      <Tabs>
        <Tab heading="Summary">
          <RootComponent>
            <Wrapper><Form {...props} /></Wrapper>
          </RootComponent>
        </Tab>
        <Tab heading="Diagnosis">
          <RootComponent>
            <Wrapper><Diagnoses {...props} /></Wrapper>
          </RootComponent>
        </Tab>
      </Tabs>
    </>
  );
};

PreviewSessionForm.propTypes = {
  scrollable: PropTypes.bool,
  form: PropTypes.array.isRequired,
  Wrapper: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
};

export default PreviewSessionForm;
