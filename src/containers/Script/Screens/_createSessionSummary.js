export default ({
  parseCondition,
  activeScreen,
  startTime: start_time,
  entries: form,
  script,
  evaluateCondition,
  diagnoses,
  appState: { application, location },
  matches,
}) => function createSessionSummary(_payload = {}) {
  console.log(matches);
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

  return {
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
      diagnoses: [],
    },
  };
};
