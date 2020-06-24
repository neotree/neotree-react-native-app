export default ({
  isLastScreen,
  state: { form, activeScreen, }
}) => () => {
  if (!activeScreen) return false;

  if (!form.filter(({ screenId }) => screenId === activeScreen.id)[0]) return false;

  return isLastScreen();
};
