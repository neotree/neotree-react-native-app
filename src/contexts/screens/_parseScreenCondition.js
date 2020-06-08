export default ({ state }) => (_condition, form = state.form) => {
  if (!_condition) return _condition;

  const condition = form.reduce((acc, { screen, entry: { value } }) => {
    if (!value) return acc;

    const replace = (condition, key, value) => {
      value = value || '';
      return condition
        .split(`$${key} =`).join(`'${value}' =`)
        .split(`$${key}=`).join(`'${value}' =`)
        .split(`$${key} >`).join(`'${value}' >`)
        .split(`$${key}>`).join(`'${value}' >`)
        .split(`$${key} <`).join(`'${value}' <`)
        .split(`$${key}<`).join(`'${value}' <`);
    };

    if (value.map) {
      const chunks = value.map(({ field }) => {
        return value.reduce((acc, { field, value: v }) => {
          return replace(acc || '', field.key, v);
        }, field.condition);
      })
        .filter(chunk => chunk);

      if (chunks.filter(chunk => chunk !== acc).length) {
        return chunks.filter(c => c !== acc).join(' || ');
      }

      return acc;
    }

    const metadata = screen.data.metadata || {};

    return replace(acc, metadata.key, form);
  }, _condition)
    .replace(new RegExp(' and ', 'gi'), ' && ')
    .replace(new RegExp(' or ', 'gi'), ' || ')
    .replace(new RegExp(' = ', 'gi'), ' == ');

  return condition;
};
