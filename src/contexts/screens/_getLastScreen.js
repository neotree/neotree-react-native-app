export default ({
  parseScreenCondition,
  state: { screens, activeScreen, }
}) => () => {
  if (!activeScreen) return false;

  const getLastScreen = (s = activeScreen) => {
    if (!s) return s;

    const getIndex = s => screens.map(s => s.id).indexOf(s.id);
    let next = screens[getIndex(s) + 1];

    if (s.data.condition) {
      try {
        if (!eval(parseScreenCondition(s.condition))) {
          next = getLastScreen(screens[getIndex(next) + 1]);
        }
      } catch (e) {
        // do nothing
      }
    }

    if (next) s = getLastScreen(next);

    return s;
  };

  return getLastScreen();
};
