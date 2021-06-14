export default ({
  parseCondition,
  activeScreen,
  startTime: start_time,
  entries: form,
  script,
  evaluateCondition,
  diagnoses,
  appState: { application, location },
}) => function createSessionSummary(_payload = {}) {
  diagnoses = (diagnoses || []).reduce((acc, d) => {
    if (acc.map(d => d.diagnosis_id).includes(d.diagnosis_id)) return acc;
    return [...acc, d];
  }, []);

  const { completed, canceled, diagnoses: parsedDiagnoses, ...payload } = _payload;

  const uid = form.reduce((acc, { values }) => {
    const uid = values.reduce((acc, { key, value }) => {
      if (`${key}`.match(/uid/gi)) return value;
      return acc;
    }, null);

    return uid || acc;
  }, null);

  const diagnosesRslts = !completed ? [] : parsedDiagnoses || (() => {
    const rslts = (diagnoses || []).filter(({ data: { symptoms, expression } }) => {
      return expression || (symptoms || []).length;
    }).map(d => {
      const { data: { symptoms: s, expression } } = d;
      const symptoms = s || [];

      const _symptoms = symptoms.filter(s => s.expression).filter(s => evaluateCondition(parseCondition(s.expression)));
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
      return conditionMet ? { ...d.data, symptoms: _symptoms, ...d, } : null;
    }).filter(d => d);

    return rslts;
  })();

  const sessionSummary = {
    ...payload,
    uid,
    script_id: activeScreen.script_id,
    data: {
      app_mode: application.mode,
      country: location.country,
      hospital_id: location.hospital,
      started_at: start_time,
      completed_at: completed ? new Date().toISOString() : null,
      canceled_at: canceled ? new Date().toISOString() : null,
      script,
      form,
      diagnoses: diagnosesRslts,
    },
  };

  return sessionSummary;
};
