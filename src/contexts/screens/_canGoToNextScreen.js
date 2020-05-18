export default ({
  state: {
    screens,
    form,
    activeScreenIndex,
    activeScreen,
  }
}) => () => {
  if (!activeScreen) return false;

  if (!form[activeScreen.id]) return false;

  return activeScreenIndex < (screens.length - 1);
};
