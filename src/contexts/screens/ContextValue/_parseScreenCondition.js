import _parseScreenCondition from '../_parseScreenCondition';

export default function parseScreenCondition(_condition = '', form) { 
  const { state: { form: f, configuration } } = this;
  let condition = form ? _parseScreenCondition(_condition, { form, configuration }) : _condition;
  condition = _parseScreenCondition(condition, { form: f, configuration });
  return condition;
}
