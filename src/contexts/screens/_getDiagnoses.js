export default function getDiagnoses() {
  return (this.diagnoses || []).filter(({ data: { symptoms, expression } }) => {
    return expression || (symptoms || []).length;
  }).map(d => {
    const { data: { symptoms: s, expression } } = d;
    const symptoms = s || [];

    const evaluate = condition => {
      return this.evaluateScreenCondition(this.parseScreenCondition(condition)); // conditionMet
    };

    const _symptoms = symptoms.filter(s => evaluate(s.expression));
    const conditionMet = _symptoms.length || evaluate(expression);
    return conditionMet ? { ...d, data: { ...d.data, symptoms: _symptoms } } : null;
  }).filter(d => d);
}
