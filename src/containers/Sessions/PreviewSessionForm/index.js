import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { Tabs, Tab } from 'native-base';
import Form from './Form';
import Diagnoses from './Diagnoses';

const PreviewSessionForm = ({ scrollable, ...props }) => {
  scrollable = scrollable !== false;
  const RootComponent = scrollable ? ScrollView : React.Fragment;

  return (
    <>
      <Tabs>
        <Tab heading="Summary">
          <RootComponent>
            <Form {...props} />
          </RootComponent>
        </Tab>
        
        <Tab heading="Diagnosis">
          <RootComponent>
            <Diagnoses {...props} />
          </RootComponent>
        </Tab>
      </Tabs>
    </>
  );
};

PreviewSessionForm.propTypes = {
  scrollable: PropTypes.bool,
};

export default PreviewSessionForm;
