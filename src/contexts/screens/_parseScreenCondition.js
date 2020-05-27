export default ({ state }) => (_condition, form = state.form) => {
  if (!_condition) return _condition;

  const entries = JSON.stringify(state.form) === JSON.stringify(form) ?
    Object.keys(form).map(key => form[key]).filter(entry => entry && entry.form)
    :
    form.map(f => ({ ...f, form: f.value }));

  const condition = entries
    .reduce((acc, entry) => {
      acc = acc.trim().replace('&', ' and ').replace(/\s+/g, ' ');
      const replace = (condition, key, value) => {
        value = value || '';
        return condition.split(`$${key} =`).join(`'${value}' =`)
          .split(`$${key}=`).join(`'${value}' =`)
          .split(`$${key} >`).join(`'${value}' >`)
          .split(`$${key}>`).join(`'${value}' >`)
          .split(`$${key} <`).join(`'${value}' <`)
          .split(`$${key}<`).join(`'${value}' <`);
      };

      if (entry.form && entry.form.map) {
        const chunks = entry.form.map(f => ({ ...f, condition: acc }))
          .map(f => replace(f.condition, f.key || entry.key, f.value));
        if (chunks.filter(c => c !== acc).length) {
          return chunks.filter(c => c !== acc).join(' || ');
        }
        return acc;
      }
      return replace(acc, entry.key, entry.form);
    }, _condition)
    .replace(new RegExp(' and ', 'gi'), ' && ')
    .replace(new RegExp(' or ', 'gi'), ' || ')
    .replace(new RegExp(' = ', 'gi'), ' == ');

  return condition;
};
