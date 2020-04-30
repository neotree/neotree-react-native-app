export default ({
  canGoToPrevScreen,
  goToScreen,
  state: { activeScreenIndex }
}) => () => canGoToPrevScreen() && goToScreen(activeScreenIndex - 1);
