import _parseScreenCondition from '../_parseScreenCondition';

export default function parseScreenCondition(_condition = '', ...args) {
  const { state: { configuration } } = this;
  const condition = args.reduce((acc, form) => _parseScreenCondition(acc, { form, configuration }), _condition);
  return condition;
}
