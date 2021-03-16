export default (val = 1) => {
  val = val < 1 ? 1 : val;
  const spacing = 8;
  return spacing + (spacing * (val - 1));
};
