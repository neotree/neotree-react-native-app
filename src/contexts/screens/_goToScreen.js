export default ({
  state: { activeScreenIndex, form, screens },
  parseScreenCondition,
  router: {
    history,
    match: { params: { scriptId } },
  }
}) => (direction = 'next') => {
  if (direction === 'back') {
    history.goBack();
    return;
  }

  const getScreen = (i = activeScreenIndex) => {
    let index = i + 1;
    index = index < 0 ? 0 : index > (screens.length - 1) ? (screens.length - 1) : index;
    return { index, screen: screens[index] };
  };

  const getTargetScreen = (i = activeScreenIndex) => {
    let target = getScreen(i);
    const { index, screen } = target;

    const condition = parseScreenCondition(screen.data.condition);

    if (!condition) return target;

    let conditionMet = false;

    try {
      conditionMet = eval(condition);
    } catch (e) {
      // do nothing
    }

    return conditionMet ? target : getTargetScreen(index);
  };

  const target = getTargetScreen();
  history.push(`/script/${scriptId}/screen/${target.screen.id}`);
};
