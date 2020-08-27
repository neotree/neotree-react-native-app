export default function exportToApi(_sessions = [], opts = {}) {
  const { showConfidential } = opts;

  const sessions = _sessions.map(s => {
    const { script, form } = s.data;

    return {
      uid: s.uid,
      scriptTitle: script.id,
      script: { id: script.id, title: script.data.title },
      entries: form
        .map(e => ({
          ...e,
          values: e.values.filter(v => v.confidential ? showConfidential : true)
        }))
        .reduce((acc, e) => {
          return [
            ...acc,
            ...e.values.map(({ key, type, dataType, value, label, valueText, }) => ({
              key,
              type: dataType || type,
              values: value && value.map ? 
                value.map(({ value, valueText, label, }) => ({ value: valueText || value, label })) 
                : 
                [{ value: valueText || value, label }],
            }))
          ];
        }, []),
    };
  });

  return sessions;
}
