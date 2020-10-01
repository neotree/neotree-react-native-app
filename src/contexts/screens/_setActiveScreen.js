export default function setActiveScreen(i = 0, cb) {
  const {
    setState,
    state: { screens }
  } = this;
  const activeScreenIndex = i < 0 ? 0 : i > (screens.length - 1) ? (screens.length - 1) : i || 0;
  const activeScreen = screens[activeScreenIndex];
  setState({ activeScreen, activeScreenIndex });
  if (cb) cb(activeScreen);
}
