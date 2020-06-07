export default ({
  isLastScreen,
  state: { form, activeScreen, }
}) => () => {
  if (!activeScreen) return false;

  if (!form[activeScreen.id]) return false;

  return isLastScreen();
};
