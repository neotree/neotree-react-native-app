export default ({
  setState,
  state: { screens }
}) => (i = 0, cb) => {
  const activeScreenIndex = i < 0 ? 0 : i > (screens.length - 1) ? (screens.length - 1) : i || 0;
  const activeScreen = screens[activeScreenIndex];
  setState({ activeScreen, activeScreenIndex });
  if (cb) cb(activeScreen);
};
