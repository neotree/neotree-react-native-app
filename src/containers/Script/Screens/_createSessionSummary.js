export default ({
  parseCondition,
  activeScreen,
  startTime: start_time,
  entries: form,
  script,
  evaluateCondition,
  diagnoses,
}) => function createSessionSummary(_payload = {}) {
  const { completed, canceled, ...payload } = _payload;

  const uid = form.reduce((acc, { values }) => {
    const uid = values.reduce((acc, { key, value }) => {
      if (`${key}`.match(/uid/gi)) return value;
      return acc;
    }, null);

    return uid || acc;
  }, null);

  const sessionSummary = {
    ...payload,
    uid,
    script_id: activeScreen.script_id,
    data: {
      started_at: start_time,
      completed_at: completed ? new Date().toISOString() : null,
      canceled_at: canceled ? new Date().toISOString() : null,
      script,
      form,
      diagnoses: (() => {
        return (diagnoses || []).filter(({ data: { symptoms, expression } }) => {
          return expression || (symptoms || []).length;
        }).map(d => {
          const { data: { symptoms: s, expression } } = d;
          const symptoms = s || [];

          const evaluate = condition => {
            return evaluateCondition(parseCondition(condition)); // conditionMet
          };

          const _symptoms = symptoms.filter(s => evaluate(s.expression));
          const conditionMet = _symptoms.length || evaluate(expression);
          return conditionMet ? { ...d, data: { ...d.data, symptoms: _symptoms } } : null;
        }).filter(d => d);
      })(),
    },
  };

  return sessionSummary;
};
