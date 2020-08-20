export default function exportToApi(_sessions = [], opts = {}) {
  const { showConfidential } = opts;

  const sessions = _sessions.map(s => {
    const { script, form } = s.data;

    const keyValues = form.reduce((acc, e) => {
      console.log(e.screen);
      e.values.forEach(v => {
        acc[v.key] = acc[v.key] || { values: [] };
        acc[v.key].key = v.key;
        acc[v.key].values.push(v);
      });
      return acc;
    }, {});

    console.log(Object.keys(keyValues).map(key => keyValues[key]));

    return {
      uid: s.uid,
      scriptId: script.id,
      script: { id: script.id, title: script.data.title },
      entries: form
        .map(e => ({
          ...e,
          values: e.values.filter(v => v.confidential ? showConfidential : true)
        }))
        .reduce((acc, e) => {
          return [
            ...acc,
            ...e.values.map(({ key, dataType, value, label, }) => ({
              key,
              type: dataType,
              values: [{ value, label }],
            }))
          ];
        }, []),
    };
  });

  return sessions.map(({ uid, scriptId, ...data }) => ({
    uid,
    scriptId,
    data,
  }));
}
