export default ({
  isLastScreen,
  state: { form, activeScreen, }
}) => () => {
  return true;
  
  if (!activeScreen) return false;

  if (!form[activeScreen.id]) return false;

  return !isLastScreen();
};
