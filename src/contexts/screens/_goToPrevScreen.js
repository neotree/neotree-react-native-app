export default ({
  canGoToPrevScreen,
  goToScreen,
}) => () => canGoToPrevScreen() && goToScreen('back');
