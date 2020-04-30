export default ({
  setActiveScreen,
  state: { activeScreenIndex },
  router: {
    history,
    match: { params: { scriptId } }
  }
}) => (i = 0) => setActiveScreen(i, activeScreen => {
  if (activeScreen) {
    history.push(`/script/${scriptId}${activeScreenIndex === 0 ? '' : `/screen/${activeScreen.id}`}`);
  }
});
