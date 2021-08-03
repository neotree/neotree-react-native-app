import React from 'react';
import { Modal, View } from 'react-native';
import PropTypes from 'prop-types';
import Fab from '@/components/Fab';
import { MaterialIcons } from '@expo/vector-icons';
import { DiagnosisContext } from './Context';
import SelectDiagnoses from './SelectDiagnoses';
import ManageSelectedDiagnoses from './ManageSelectedDiagnoses';

const getDefaultDiagnosis = d => ({
  symptoms: [],
  name: '',
  suggested: false,
  priority: null,
  how_agree: null,
  hcw_follow_instructions: null,
  hcw_reason_given: null,
  isPrimaryProvisionalDiagnosis: false,
  ...d,
});

const diagnosisToEntryValue = d => ({
  label: d.name,
  key: d.name,
  value: d.name,
  valueText: d.name,
  type: 'diagnosis',
  dataType: 'diagnosis',
  diagnosis: {
    ...getDefaultDiagnosis(),
    ...d,
  },
});

function Diagnosis(props) {
  const { getSuggestedDiagnoses, entry, setEntry, goNext } = props;
  const [section, setSection] = React.useState('select');
  const [diagnosesEntry, setDiagnosesEntry] = React.useState({
    values: [],
  });

  React.useEffect(() => {
    setDiagnosesEntry({
      values: getSuggestedDiagnoses().map(d => diagnosisToEntryValue(d)),
      ...entry
    });
  }, [entry]);

  const diagnoses = diagnosesEntry.values.map(v => v.diagnosis);
  const acceptedDiagnoses = diagnoses.filter(d => d.how_agree);

  const [activeDiagnosisIndex, setActiveDiagnosisIndex] = React.useState(acceptedDiagnoses.length ? acceptedDiagnoses.length - 1 : null);

  const _goNext = () => {
    if (section === 'select') {
      if (!diagnoses.length) {
        setEntry(diagnosesEntry);
        setTimeout(() => goNext(), 10);
      } else {
        setSection('manage');
      }
    }

    if (section === 'manage') {
      const activeIndex = activeDiagnosisIndex === null ? 0 : activeDiagnosisIndex + 1;
      if (activeIndex < acceptedDiagnoses.length - 1) {
        setActiveDiagnosisIndex(activeIndex);
      } else {
        goNext();
      }
    }
  };

  return (
    <DiagnosisContext.Provider
      value={{
        props,
        section,
        diagnosesEntry,
        setSection,
        setDiagnosesEntry,
        getDefaultDiagnosis,
        diagnosisToEntryValue,
        diagnoses,
        setDiagnoses: (diagnoses = []) => setDiagnosesEntry({
          values: diagnoses.map(d => diagnosisToEntryValue(d)),
        }),
        goNext: _goNext,
      }}
    >
      <Modal
        visible
        transparent
        onRequestClose={() => {
          if (section === 'select') {
            props.goBack();
          }
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
          }}
        >
          {activeDiagnosisIndex !== null ? null : (
            <>
              {section === 'select' && <SelectDiagnoses />}
              {section === 'manage' && <ManageSelectedDiagnoses />}
            </>
          )}

          <Fab
            onPress={() => _goNext()}
          >
            <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="arrow-forward" />
          </Fab>
        </View>
      </Modal>
    </DiagnosisContext.Provider>
  );
}

Diagnosis.propTypes = {
  goBack: PropTypes.func.isRequired,
  getSuggestedDiagnoses: PropTypes.func.isRequired,
  entry: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
  goNext: PropTypes.func.isRequired,
};

export default Diagnosis;
