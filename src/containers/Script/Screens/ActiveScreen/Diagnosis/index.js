import React from 'react';
import { Alert, Modal, View } from 'react-native';
import PropTypes from 'prop-types';
import Fab from '@/components/Fab';
import { MaterialIcons } from '@expo/vector-icons';
import { DiagnosisContext } from './Context';
import SelectDiagnoses from './SelectDiagnoses';
import ManageSelectedDiagnoses from './ManageSelectedDiagnoses';
import FullDiagnosis from './FullDiagnosis';
import { setPageOptions } from '../../../Context';

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
  setPageOptions({ hideFAB: true }, []);

  const { getSuggestedDiagnoses, entry, setEntry, goNext, goBack, } = props;
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
  const acceptedDiagnoses = diagnoses.filter(d => d.how_agree !== 'No');

  const [activeDiagnosisIndex, setActiveDiagnosisIndex] = React.useState(null);
  
  const _goBack = () => {
    if (activeDiagnosisIndex === null) {
      if (section === 'manage') setSection('select');
      if (section === 'select') goBack();
    } else {
      const nextIndex = activeDiagnosisIndex - 1;
      if (nextIndex < 0) {
        setActiveDiagnosisIndex(null);
      } else if (acceptedDiagnoses[nextIndex]) {
        setActiveDiagnosisIndex(nextIndex);
      }
    }
  };

  const _goNext = () => {
    if (activeDiagnosisIndex === null) {
      if (section === 'select') {
        if (!diagnoses.length) {
          Alert.alert(
            'Warning',
            'Continue without selecting diagnoses?',
            [
              {
                text: 'No',
                onPress: () => {},
                style: 'cancel'
              },
              {
                text: 'Yes',
                onPress: () => {
                  setEntry(diagnosesEntry);
                  setTimeout(() => goNext(), 10);
                },
                style: 'cancel'
              },
            ]
          );
        } else {
          setSection('manage');
        }
      }

      if (section === 'manage') {
        if (acceptedDiagnoses[0]) {
          setActiveDiagnosisIndex(0);
        } else {
          goNext();
        }
      }
    } else {
      const activeIndex = activeDiagnosisIndex + 1;
      if (activeIndex < acceptedDiagnoses.length) {
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
        diagnoses,
        acceptedDiagnoses,
        activeDiagnosisIndex,
        setActiveDiagnosisIndex,
        getDefaultDiagnosis,
        diagnosisToEntryValue,
        setDiagnoses: (diagnoses = []) => {
          const entryValues = diagnoses.map(d => diagnosisToEntryValue(d));
          setDiagnosesEntry({ values: entryValues, });
          setEntry({ values: entryValues });
        },
        goNext: _goNext,
        goBack: _goBack,
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
          {activeDiagnosisIndex !== null ? <FullDiagnosis /> : (
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
