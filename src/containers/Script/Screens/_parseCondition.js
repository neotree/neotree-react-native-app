const sanitizeCondition = (condition = '') => {
  let sanitized = condition
    .replace(new RegExp(' and ', 'gi'), ' && ')
    .replace(new RegExp(' or ', 'gi'), ' || ')
    .replace(new RegExp(' = ', 'gi'), ' == ');
  sanitized = sanitized.split(' ')
    .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
  return sanitized;
};

const parseConditionString = (condition = '', _key = '', value) => {
  const s = (condition || '').toLowerCase().split('$').join(' $');
  const key = (_key || '').toLowerCase();
  const parsed = s.replace(/\s\s+/g, ' ')
    .split(`$${key} =`).join(`${value} =`)
    .split(`$${key}=`).join(`${value} =`)
    .split(`$${key} >`).join(`${value} >`)
    .split(`$${key}>`).join(`${value} >`)
    .split(`$${key} <`).join(`${value} <`)
    .split(`$${key}<`).join(`${value} <`)
    .split(`$${key}!`).join(`${value} !`)
    .split(`$${key} !`).join(`${value} !`);
  return parsed;
};

export default ({ configuration, entries: form }) => function parseCondition(_condition = '', entries = []) {
  form = form || [];

  _condition = (_condition || '').toString();
  entries = entries ? entries.map ? entries : [entries] : [];

  const _form = entries.reduce((acc, e) => {
    const index = !e.screen ? -1 : acc.map(e => e.screen.id).indexOf(e.screen.id);
    if (index > -1) return acc.map((_e, i) => i === index ? { ..._e, ...e } : _e);
    return [...acc, e];
  }, form);

  const parseValue = (condition, { value, type, key, dataType, }) => {
    value = value === null ? null : (value || '');
    const t = dataType || type;

    switch (t) {
      case 'number':
        value = value || JSON.stringify('null'); // null;
        break;
      case 'boolean':
        value = value === 'false' ? false : Boolean(value);
        break;
      default:
        value = "''";
    }

    return parseConditionString(condition, key, value);
  };

  let parsedCondition = _form.reduce((condition, { screen, values }) => {
    values = (values || []).filter(e => (e.value !== null) || (e.value !== undefined));
    values = values.reduce((acc, e) => [
      ...acc,
      ...(e.value && e.value.map ? e.value : [e]),
    ], []);

    let c = values.reduce((acc, v) => parseValue(acc, v), condition);

    if (screen) {
      let chunks = [];
      switch (screen.type) {
        case 'multi_select':
          chunks = values.map(v => parseValue(condition, v)).filter(c => c !== condition);
          c = (chunks.length > 1 ? chunks.map(c => `(${c})`) : chunks).join(' || ');
          break;
        default:
          // do nothing
      }
    }

    return c || condition;
  }, _condition);

  if (configuration) {
    parsedCondition = Object.keys(configuration).reduce((acc, key) => {
      return parseConditionString(acc, key, configuration[key] ? true : false);
    }, parsedCondition);
  }

  return sanitizeCondition(parsedCondition);
};
