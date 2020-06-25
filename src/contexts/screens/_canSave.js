export default ({
  isLastScreen,
  state: { form, activeScreen, }
}) => () => {
  if (!activeScreen) return false;

  if (!form.filter(({ screen }) => screen.id === activeScreen.id)[0]) return false;

  return isLastScreen();
};
