export default ({
  scriptContext: { state: { form } },
  state: {
    screens,
    activeScreenIndex,
    activeScreen,
  }
}) => () => {
  // if (activeScreen && !form[activeScreen.id]) return false;

  return activeScreenIndex < (screens.length - 1);
};
