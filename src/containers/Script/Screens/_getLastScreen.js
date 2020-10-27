export default ({
  parseCondition,
  activeScreen,
  screens,
  entries: form,
  evaluateCondition
}) => function getLastScreen() {
  if (!activeScreen) return null;

  const getScreenIndex = s => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
  const activeScreenIndex = getScreenIndex(activeScreen);

  const getLastScreen = (currentIndex) => {
    const _current = screens[currentIndex];

    const nextIndex = currentIndex + 1;
    let next = screens[nextIndex];

    if (next && next.data.condition) {
      const conditionMet = evaluateCondition(parseCondition(next.data.condition, form.filter(e => e.screen.id !== next.id)));
      if (!conditionMet) {
        const nextNextIndex = nextIndex + 1;
        next = nextNextIndex > screens.length ? null : getLastScreen(nextNextIndex);
      }
    }

    const lastIndex = getScreenIndex(next);
    return lastIndex > -1 ? getLastScreen(lastIndex) : _current;
  };

  return getLastScreen(activeScreenIndex);
};
