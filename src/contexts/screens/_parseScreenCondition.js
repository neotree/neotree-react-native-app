const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

export default function parseScreenCondition({ state }) { 
  return (_condition = '', form = state.form) => {
    const parseConditionString = (s = '', key, value) => s
    .split(`$${key} =`).join(`${value} =`)
    .split(`$${key}=`).join(`${value} =`)
    .split(`$${key} >`).join(`${value} >`)
    .split(`$${key}>`).join(`${value} >`)
    .split(`$${key} <`).join(`${value} <`)
    .split(`$${key}<`).join(`${value} <`);

    const parseForm = (_condition = '', form) => {
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

        return parseConditionString(acc, key, value);
      }, _condition);
      return condition;
    };

    let condition = form ? parseForm(_condition, form) : _condition;
    condition = parseForm(condition, state.form);

    return sanitizeCondition(condition);
  };
}
