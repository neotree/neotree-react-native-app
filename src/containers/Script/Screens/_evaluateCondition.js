export default (condition, defaultEval = false) => {
  let conditionMet = defaultEval;
  try {
    conditionMet = eval(condition);
  } catch (e) {
    // do nothing
  }
  return conditionMet;
};
