import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { H3 } from 'native-base';
import OverlayLoader from '@/components/OverlayLoader';
import SelectDiagnoses from './SelectDiagnoses';
import ManageSelectedDiagnoses from './ManageSelectedDiagnoses';

const defaultDiagnosis = {
  symptoms: [],
  name: '',
  suggested: false,
  priority: null,
  how_agree: null,
  hcw_follow_instructions: null,
  hcw_reason_given: null,
  isPrimaryProvisionalDiagnosis: false,
};

const diagnosisToValue = d => ({
  label: d.name,
  key: d.name,
  value: d.name,
  valueText: d.name,
  type: 'diagnosis',
  dataType: 'diagnosis',
  diagnosis: d
});

const Diagnosis = props => {
  const { getSuggestedDiagnoses, setEntry, entry, } = props;
  const [screenIsReady, setScreenIsReady] = React.useState(false);
  const [diagnoses, _setDiagnoses] = React.useState(entry ? entry.values.map(v => v.diagnosis) : []);
  const [section, setSection] = React.useState(entry && entry.values.length ? 'manage_selected' : 'select');

  const setDiagnoses = React.useCallback((diagnoses = []) => {
    let _diagnoses = [];
    _setDiagnoses(prev => {
      _diagnoses = (typeof diagnoses === 'function') ? diagnoses(prev) : diagnoses;
      return _diagnoses;
    });
    setEntry({
      ...entry,
      values: [
        {
          label: 'Primary Provisional Diagnosis',
          key: 'Primary Provisional Diagnosis',
          value: _diagnoses.filter(d => d.isPrimaryProvisionalDiagnosis)
            .map(d => diagnosisToValue(d)),
        },
        {
          label: 'Other Problems',
          key: 'Other Problems',
          value: _diagnoses
            .filter(d => !d.isPrimaryProvisionalDiagnosis)
            .map(d => diagnosisToValue(d)),
        },
      ].filter(({ value }) => value.length),
    });
  }, [entry]);

  React.useEffect(() => {
    if (!entry) {
      const diagnoses = getSuggestedDiagnoses();
      setDiagnoses(diagnoses.map(d => ({
        ...defaultDiagnosis,
        ...d,
      })));
    }
    setScreenIsReady(true);
  }, [entry]);

  if (!screenIsReady) return <OverlayLoader display transparent />;

  const renderComponent = Component => (
    <Component
      {...props}
      diagnoses={diagnoses}
      setDiagnoses={setDiagnoses}
      defaultDiagnosis={defaultDiagnosis}
      setSection={setSection}
      diagnosisToValue={diagnosisToValue}
    />
  );

  return (
    <View>
      {section === 'select' && renderComponent(SelectDiagnoses)}
      {section === 'manage_selected' && renderComponent(ManageSelectedDiagnoses)}
    </View>
  );
};

Diagnosis.propTypes = {
  entry: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
  getSuggestedDiagnoses: PropTypes.func.isRequired,
};

export default Diagnosis;