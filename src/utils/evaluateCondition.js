import { Parser } from 'expr-eval';

const sanitizeCondition = (condition = '') => condition
  .replace(new RegExp(' and ', 'gi'), ' && ')
  .replace(new RegExp(' or ', 'gi'), ' || ')
  .replace(new RegExp(' = ', 'gi'), ' == ');

export default function evaluateCondition(condition, opts = {}) {
  const { entries: _entries, configuration } = opts;
  const entries = _entries || [];

  const generateKeys = (entries = [], _keys = {}) => {
    const keys = entries.reduce((acc, { values }) => {
      values = (values || []).filter(e => (e.value !== null) || (e.value !== undefined));

      values.forEach(({ key, value, type, dataType }) => {
        value = ((value === null) || (value === undefined)) ? 'no value' : value;
        const t = dataType || type;

        switch (t) {
          // case 'number':
          //   value = value || null;
          //   break;
          case 'boolean':
            value = value === 'false' ? false : Boolean(value);
            break;
          default:
            value = JSON.stringify(value);
        }
        acc[`$${key}`] = value;
      });
      return acc;
    }, _keys);

    if (configuration) Object.keys(configuration).forEach(key => { keys[key] = configuration[key] ? true : false; });

    return keys;
  };

  try {
    const multi_select = entries.filter(e => e.screen.type === 'multi_select');
    const _keys = generateKeys(entries.filter(e => e.screen.type !== 'multi_select'), {});
    const keys = !multi_select.length ? [_keys] : multi_select.reduce((acc, e) => {
      const val = e.value && e.value.map ? e.value : [e.value];
      val.forEach(v => acc.push(generateKeys({ ...e, value: v }, _keys)));
      return acc;
    }, []);

    return keys.reduce((val, keys) => {
      const rslt = Parser.evaluate(sanitizeCondition(condition), keys);
      if (rslt) return rslt;
      return val;
    }, false);
  } catch (e) { console.log(e); return false; }
};
