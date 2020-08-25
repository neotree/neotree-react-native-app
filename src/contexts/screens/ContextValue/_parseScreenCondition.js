const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

const parseConditionString = (condition = '', _key = '', value) => {
  const s = condition.toLowerCase();
  const key = _key.toLowerCase();
  return !s ? '' : s.replace(/\s\s+/g, ' ')
    .split(`$${key} =`).join(`${value} =`)
    .split(`$${key}=`).join(`${value} =`)
    .split(`$${key} >`).join(`${value} >`)
    .split(`$${key}>`).join(`${value} >`)
    .split(`$${key} <`).join(`${value} <`)
    .split(`$${key}<`).join(`${value} <`);
};

export default function parseScreenCondition(_condition = '', entries = []) {
  _condition = _condition.toString();
  entries = entries ? entries.map ? entries : [entries] : [];

  const { state: { form, configuration, } } = this;

  const _form = entries.reduce((acc, e) => {
    const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
    if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e);
    return [...acc, e];
  }, form);

  let condition = _form.reduce((condition, { values }) => {
    values = values.reduce((acc, e) => [
      ...acc,
      ...(e.value && e.value.map ? e.value : [e]),
    ], []);
    
    const c = values.map(({ value, type, key, dataType, valueText }) => {
      value = value || '';
      const t = dataType || type;

      switch (t) {
        case 'number':
          value = valueText || value || null;
          break;
        case 'boolean':
          value = value === 'false' ? false : Boolean(value);
          break;
        default:
          value = JSON.stringify(value);
      }

      return parseConditionString(condition, key, value);
    })
      .filter(c => c !== condition)
      .map(c => `(${c})`)
      .join(' || ');

    return c || condition;
  }, _condition);

  if (configuration) {
    condition = Object.keys(configuration).reduce((acc, key) => {
      return parseConditionString(acc, key, configuration[key] ? true : false);
    }, condition);
  }

  return sanitizeCondition(condition);
}
