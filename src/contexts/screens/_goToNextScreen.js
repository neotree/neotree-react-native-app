export default ({
  canGoToNextScreen,
  goToScreen,
  state: { activeScreenIndex }
}) => () => canGoToNextScreen() && goToScreen(activeScreenIndex + 1);
