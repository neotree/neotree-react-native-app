export const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

export const parseCondition = ({ state }) => (_condition = '', form = state.form) => {
  const values = form.reduce((acc, entry) => [...acc, ...entry.values], []);
  const condition = values.reduce((acc, { value, type, key, dataType }) => {
    value = value || '';
    const t = dataType || type;

    switch(t) {
      case 'number':
        value = value || null;
        break;
      case 'boolean':
        value = value || false;
        break;
      default:
        value = JSON.stringify(value);
    }

    return acc
      .split(`$${key} =`).join(`${value} =`)
      .split(`$${key}=`).join(`${value} =`)
      .split(`$${key} >`).join(`${value} >`)
      .split(`$${key}>`).join(`${value} >`)
      .split(`$${key} <`).join(`${value} <`)
      .split(`$${key}<`).join(`${value} <`);
  }, _condition);
  return condition;
};
