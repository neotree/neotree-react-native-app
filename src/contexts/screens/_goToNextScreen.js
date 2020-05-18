export default ({
  canGoToNextScreen,
  goToScreen,
}) => () => canGoToNextScreen() && goToScreen('next');
