import React from 'react';
import PropTypes from 'prop-types';
import { _parseScreenCondition } from '@/contexts/screens/_parseScreenCondition';
import { getDiagnoses } from '@/api/diagnoses';

const Diagnosis = ({ form, scriptId }) => {
  const [diagnoses, setDiagnoses] = React.useState([]);
  const [formDiagnoses, setFormDiagnoses] = React.useState([]);

  React.useEffect(() => {
    getDiagnoses({ script_id: scriptId })
      .then(res => setDiagnoses(res.diagnoses || []));
  }, []);

  React.useEffect(() => {
    const formDiagnoses = diagnoses.filter(({ data: { symptoms, expression } }) => {
      return expression || (symptoms || []).length;
    })
    .map(d => {
      const { data: { symptoms: s, expression } } = d;
      const symptoms = s || [];
  
      const evaluate = condition => {
        let conditionMet = false;
        try {
          conditionMet = eval(_parseScreenCondition(condition, { form }));
        } catch (e) {
          // do nothing
        }
        return conditionMet;
      };
  
      const _symptoms = symptoms.filter(s => evaluate(s.expression));
      const conditionMet = _symptoms.length || evaluate(expression);
      return conditionMet ? { ...d, data: { ...d.data, symptoms: _symptoms } } : null;
    })
    .filter(d => d);
  
    setFormDiagnoses(formDiagnoses);
  }, [diagnoses]);

  console.log(`${formDiagnoses.length} / ${diagnoses.length}`, formDiagnoses);

  return (
    <>
      
    </>
  );
};

Diagnosis.propTypes = {
  scriptId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  form: PropTypes.array.isRequired,
};

export default Diagnosis;
