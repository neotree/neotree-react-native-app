const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

export default function parseScreenCondition(_condition = '', opts = {}) {
  const { form, configuration } = opts;

  const parseConditionString = (s = '', key, value) => !s ? '' : s
    .split(`$${key} =`).join(`${value} =`)
    .split(`$${key}=`).join(`${value} =`)
    .split(`$${key} >`).join(`${value} >`)
    .split(`$${key}>`).join(`${value} >`)
    .split(`$${key} <`).join(`${value} <`)
    .split(`$${key}<`).join(`${value} <`);

  const parseForm = (_condition = '', form) => {
    const values = form.reduce((acc, entry) => [...acc, ...entry.values], []);
    const chunks = values.map(({ value, type, key, dataType }) => {
      value = value || '';
      const t = dataType || type;

      switch (t) {
        case 'number':
          value = value || null;
          break;
        case 'boolean':
          value = value === 'false' ? false : Boolean(value);
          break;
        default:
          value = JSON.stringify(value);
      }

      return parseConditionString(_condition, key, value);
    }).filter(c => c !== _condition);

    const parsedCondition = (chunks.length > 1 ? chunks.map(c => `(${c})`) : chunks)
      .join(' || ');

    return parsedCondition || _condition;
  };

  let condition = form ? parseForm(_condition, form) : _condition;

  if (configuration) {
    condition = Object.keys(configuration).reduce((acc, key) => {
      return parseConditionString(acc, key, configuration[key] ? true : false);
    }, condition);
  }

  return sanitizeCondition(condition);
}
