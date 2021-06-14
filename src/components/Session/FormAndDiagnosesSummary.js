import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { Tabs, Tab } from 'native-base';
import Summary from './Summary';
import Diagnoses from './Diagnoses';

const FormAndDiagnosesSummary = ({ scrollable, ...props }) => {
  scrollable = scrollable !== false;
  const RootComponent = scrollable ? ScrollView : React.Fragment;

  return (
    <>
      <Tabs>
        <Tab heading="Summary">
          <RootComponent>
            <Summary {...props} />
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

FormAndDiagnosesSummary.propTypes = {
  scrollable: PropTypes.bool,
};

export default FormAndDiagnosesSummary;
