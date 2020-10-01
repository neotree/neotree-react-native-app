export default function getLastScreen() {
  const {
    parseScreenCondition,
    state: { screens, activeScreen, form, }
  } = this;

  if (!activeScreen) return false;

  const getScreenIndex = s => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
  const activeScreenIndex = getScreenIndex(activeScreen);

  const getLastScreen = (currentIndex) => {
    const _current = screens[currentIndex];

    const nextIndex = currentIndex + 1;
    let next = screens[nextIndex];

    if (next && next.data.condition) {
      let conditionMet = false;
      try {
        conditionMet = eval(parseScreenCondition(next.data.condition, form.filter(e => e.screen.id !== next.id)));
      } catch (e) {
        // do nothing
      }
      if (!conditionMet) {
        const nextNextIndex = nextIndex + 1;
        next = nextNextIndex > screens.length ? null : getLastScreen(nextNextIndex);
      }
    }

    const lastIndex = getScreenIndex(next);
    return lastIndex > -1 ? getLastScreen(lastIndex) : _current;
  };

  return getLastScreen(activeScreenIndex);
}
