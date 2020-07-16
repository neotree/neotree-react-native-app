export default ({
  diagnoses,
  parseScreenCondition,
  state: { form }
}) => () => {
  const d = diagnoses.filter(({ data: { metadata, expression } }) => {
    return !!(expression && ((metadata || {}).symptoms || []).length);
  })
  .map(d => {
    const { data: { metadata, expression } } = d;
    return expression;
  });

  console.log(d);
};
