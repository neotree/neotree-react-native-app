export default ({
  parseScreenCondition,
  state: { screens, activeScreen, }
}) => () => { 
  if (!activeScreen) return false;

  const getScreenIndex = s => !s ? -1 : screens.map(s => s.id).indexOf(s.id);
  const activeScreenIndex = getScreenIndex(activeScreen);

  const getLastScreen = (currentIndex = i) => {
    const _current = screens[currentIndex];

    let nextIndex = currentIndex + 1;
    let next = screens[nextIndex];

    if (next && next.data.condition) {
      let conditionMet = false;    
      try {
        conditionMet = eval(parseScreenCondition(next.data.condition));
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
};
