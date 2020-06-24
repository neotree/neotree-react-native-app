export default ({ state }) => (_condition = '', form = state.form) => {
  const values = form.reduce((acc, entry) => [...acc, ...entry.values], []);
  const condition = values.reduce((acc, { value, type, key }) => {
    value = value || '';
    value = value && (type === 'number') ? value : JSON.stringify(value);
    return acc
      .split(`$${key} =`).join(`${value} =`)
      .split(`$${key}=`).join(`${value} =`)
      .split(`$${key} >`).join(`${value} >`)
      .split(`$${key}>`).join(`${value} >`)
      .split(`$${key} <`).join(`${value} <`)
      .split(`$${key}<`).join(`${value} <`)
      .replace(new RegExp(' and ', 'gi'), ' && ')
      .replace(new RegExp(' or ', 'gi'), ' || ')
      .replace(new RegExp(' = ', 'gi'), ' == ');
  }, _condition);
  return condition;
};
