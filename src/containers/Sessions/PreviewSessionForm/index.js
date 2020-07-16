import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { Tabs, Tab } from 'native-base';
import Form from './Form';
import Diagnosis from './Diagnosis';

const PreviewSessionForm = ({ Wrapper, scrollable, ...props }) => {
  scrollable = scrollable !== false;
  Wrapper = Wrapper || React.Fragment;
  const RootComponent = scrollable ? ScrollView : React.Fragment;

  return (
    <>
      <RootComponent>
        <Tabs>
          <Tab heading="Summary">
            <Wrapper><Form {...props} /></Wrapper>
          </Tab>
          <Tab heading="Diagnosis">
            <Wrapper><Diagnosis {...props} /></Wrapper>
          </Tab>
        </Tabs>        
      </RootComponent>
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
