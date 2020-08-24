const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

const parseConditionString = (s = '', key, value) => {
  const _s = !s ? '' : s.replace(/\s\s+/g, ' ')
    .split(`$${key} =`).join(`${value} =`)
    .split(`$${key}=`).join(`${value} =`)
    .split(`$${key} >`).join(`${value} >`)
    .split(`$${key}>`).join(`${value} >`)
    .split(`$${key} <`).join(`${value} <`)
    .split(`$${key}<`).join(`${value} <`);
  return _s;
};

export default function parseScreenCondition(_condition = '', entries = []) {
  entries = entries ? entries.map ? entries : [entries] : [];

  const { state: { form, configuration, } } = this;

  const _form = entries.reduce((acc, e) => {
    const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
    if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e);
    return [...acc, e];
  }, form);

  let condition = _form.reduce((condition, { values }) => {
    return values.reduce((condition, { value, type, key, dataType, valueText }) => {
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
    }, condition);
  }, _condition);

  if (configuration) {
    condition = Object.keys(configuration).reduce((acc, key) => {
      return parseConditionString(acc, key, configuration[key] ? true : false);
    }, condition);
  }

  return sanitizeCondition(condition);
}
