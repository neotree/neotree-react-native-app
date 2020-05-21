export default ({
  state: { activeScreenIndex, form, screens },
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

    if (!screen.data.condition) return target;

    const condition = Object.keys(form)
      .filter(key => form[key])
      .map(key => screens.filter(s => `${s.id}` === `${key}`)[0])
      .map(s => {
        const { key } = (s.data.metadata || {});
        return !key ? null : ({ key, value: form[s.id].value });
      })
      .filter(key => key)
      .reduce((acc, v) => {
        return acc.split(`$${v.key}`).join(`'${v.value}'`);
      }, screen.data.condition)
      .replace(new RegExp(' and ', 'gi'), ' && ')
      .replace(new RegExp(' or ', 'gi'), ' || ')
      .replace(new RegExp(' = ', 'gi'), ' == ');

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
