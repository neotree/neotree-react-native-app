const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

export const _parseScreenCondition = (_condition = '', opts = {}) => {
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

      return parseConditionString(_condition, key, value);
    });
    return chunks
      .filter(c => c !== _condition)
      .map(c => `(${c})`)
      .join(' || ') || _condition;
  };

  let condition = form ? parseForm(_condition, form) : _condition;

  if (configuration) {
    condition = Object.keys(configuration).reduce((acc, key) => {
      return parseConditionString(acc, key, configuration[key] ? true : false);
    }, condition);
  }
  
  return sanitizeCondition(condition);
};

export default function parseScreenCondition({ state: { form: f, configuration } }) { 
  return (_condition = '', form) => {
    let condition = form ? _parseScreenCondition(_condition, { form, configuration }) : _condition;
    condition = _parseScreenCondition(condition, { form: f, configuration });
    return condition;
  }
}
