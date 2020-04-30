export default ({
  state: { screens, activeScreenIndex }
}) => () => {
  return activeScreenIndex < (screens.length - 1);
};
