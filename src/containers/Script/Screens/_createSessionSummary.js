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

  const neolabKeys = ['DateBCT', 'BCResult', 'Bac', 'CONS', 'EC', 'Ent', 'GBS', 'GDS', 'Kl', 'LFC', 'NLFC', 'OGN', 'OGP', 'Oth', 'Pseud', 'SA'];

  return {
    ...payload,
    uid: __DEV__ ? `${Number(Math.random().toString().substring(2, 6))}-TEST` : uid,
    script_id: activeScreen.script_id,
    data: {
      unique_key: `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      app_mode: application.mode,
      country: location.country,
      hospital_id: location.hospital,
      started_at: start_time,
      completed_at: completed ? new Date().toISOString() : null,
      canceled_at: canceled ? new Date().toISOString() : null,
      script,
      diagnoses: [],
      form,
      matched: script.type !== 'discharge' ? [] : matches.reduce((acc, s) => {
        if (s.data.script.type !== 'discharge') {
          Object.keys(s.data.entries).forEach(key => {
            if (neolabKeys.includes(key)) acc.push({ key, ...s.data.entries[key] });
          });
          // Object.keys(s.data.entries).forEach(key => {
          //   acc.push({ key, ...s.data.entries[key] });
          // });
        }
        return acc;
      }, []),
    },
  };
};
