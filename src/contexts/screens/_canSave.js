export default ({
  isLastScreen,
  state: { form, activeScreen, }
}) => () => {
  return false;
  
  if (!activeScreen) return false;

  if (!form[activeScreen.id]) return false;

  return isLastScreen();
};
