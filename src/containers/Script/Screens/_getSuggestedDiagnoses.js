export default ({
  parseCondition,
  evaluateCondition,
  diagnoses,
}) => function getSuggestedDiagnoses() {
  // return diagnoses.filter((d, i) => i < 4).map((d, i) => d.data);
  diagnoses = (diagnoses || []).reduce((acc, d) => {
    if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
    return [...acc, d];
  }, []);

  const diagnosesRslts = (() => {
    const rslts = (diagnoses || []).filter(({ data: { symptoms, expression } }) => {
      return expression || (symptoms || []).length;
    }).map((d, i) => {
      const { data: { symptoms: s, expression } } = d;
      const symptoms = s || [];

      const _symptoms = symptoms.filter(s => s.expression).filter(s => evaluateCondition(parseCondition(s.expression)));
      // const _symptoms = symptoms;
      const riskSignCount = _symptoms.reduce((acc, s) => {
        if (s.type === 'risk') acc.riskCount += Number(s.weight || 1);
        if (s.type === 'sign') acc.signCount += Number(s.weight || 1);
        return acc;
      }, { riskCount: 0, signCount: 0 });

      const conditionMet = evaluateCondition(parseCondition(expression, [{
        values: [
          { key: 'riskCount', value: riskSignCount.riskCount, },
          { key: 'signCount', value: riskSignCount.signCount, },
        ],
      }]));
      // const conditionMet = i < 2;
      return conditionMet ? { ...d.data, symptoms: _symptoms, ...d, } : null;
    }).filter(d => d);

    return rslts;
  })();

  return diagnosesRslts;
};
