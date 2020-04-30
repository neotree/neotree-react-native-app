export default ({
  state: { activeScreenIndex }
}) => () => {
  return activeScreenIndex > 0;
};
