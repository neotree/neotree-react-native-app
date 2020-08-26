export default function exportToApi(_sessions = [], opts = {}) {
  const { showConfidential } = opts;

  const sessions = _sessions.map(s => {
    const { script, form } = s.data;

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
            ...e.values.map(({ key, dataType, value, label, valueText, }) => ({
              key,
              type: dataType,
              values: value && value.map ? 
                value.map(({ value, valueText, label, }) => ({ value: valueText || value, label })) 
                : 
                [{ value: valueText || value, label }],
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
