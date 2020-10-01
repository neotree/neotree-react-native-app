export default function getScreen(opts = {}) {
  const {
    state: { activeScreenIndex, screens, },
    parseScreenCondition,
  } = this;

  const { index: i, direction: d } = opts;
  const direction = ['next', 'back'].includes(d) ? d : null;

  if (!isNaN(Number(i))) return screens[i] ? { screen: screens[i], index: i } : null;

  const getTargetScreen = (i = activeScreenIndex) => {
    const index = (() => {
      switch (direction) {
        case 'next':
          return i + 1;
        case 'back':
          return i - 1;
        default:
          return i;
      }
    })();

    const screen = screens[index];
    
    if (!screen) return null;

    if (!direction) return { screen, index, };

    const target = { screen, index };
    const condition = screen.data.condition;

    if (!condition) return target;

    let conditionMet = false;
    
    try {
      conditionMet = eval(parseScreenCondition(condition));
    } catch (e) {
      // do nothing
    }

    return conditionMet ? target : getTargetScreen(index);
  };

  return getTargetScreen();
}
