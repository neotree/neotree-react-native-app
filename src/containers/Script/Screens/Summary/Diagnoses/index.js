import React from 'react';
import PropTypes from 'prop-types';
import SelectDiagnoses from './SelectDiagnoses';
import ManageSelectedDiagnoses from './ManageSelectedDiagnoses';

const defaultForm = {
  name: '',
  suggested: false,
  priority: null,
  how_agree: null,
  hcw_follow_instructions: null,
  hcw_reason_given: null,
  isPrimaryProvisionalDiagnosis: false,
};

const Diagnoses = props => {
  const { summary } = props;

  const [diagnoses, setDiagnoses] = React.useState([]);
  const [section, setSection] = React.useState('select');

  React.useEffect(() => {
    setDiagnoses(summary.data.diagnoses.map((d, i) => ({
      ...defaultForm,
      ...d,
      suggested: true,
      priority: i + 1,
    })));
  }, []);

  const renderComponent = Component => (
    <Component
      {...props}
      diagnoses={diagnoses}
      setDiagnoses={setDiagnoses}
      defaultForm={defaultForm}
      setSection={setSection}
    />
  );

  return (
    <>
      {section === 'select' && renderComponent(SelectDiagnoses)}
      {section === 'manage_selected' && renderComponent(ManageSelectedDiagnoses)}
    </>
  );
};

Diagnoses.propTypes = {
  summary: PropTypes.object.isRequired,
  clearSummary: PropTypes.func.isRequired
};

export default Diagnoses;
