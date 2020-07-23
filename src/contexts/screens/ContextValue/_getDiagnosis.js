export default function getDiagnosis() {
  const {
    diagnoses,
    state: { form }
  } = this;

  const d = diagnoses.filter(({ data: { metadata, expression } }) => {
    return !!(expression && ((metadata || {}).symptoms || []).length);
  })
  .map(d => {
    const { data: { expression } } = d;
    return expression;
  });

  console.log(d);
}
