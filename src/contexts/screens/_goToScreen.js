export default ({
  state: { activeScreenIndex, form, screens },
  parseScreenCondition,
  sanitizeCondition,
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

    const condition = sanitizeCondition(parseScreenCondition(screen.data.condition, form));

    console.log(screen.data.condition, condition);

    if (!condition) return target;

    try {
      if (!eval(condition)) {
        target = getTargetScreen(index);
      }
    } catch (e) {
      // do nothing
    }

    return target;
  };

  const target = getTargetScreen();
  history.push(`/script/${scriptId}/screen/${target.screen.id}`);
};
