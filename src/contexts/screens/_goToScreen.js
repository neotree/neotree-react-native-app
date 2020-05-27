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
      .map(key => form[key])
      .filter(entry => entry && entry.form)
      .reduce((acc, entry) => {
        acc = acc.trim().replace('&', ' and ').replace(/\s+/g, ' ');
        const replace = (condition, key, value) => {
          return condition.split(`$${key} =`).join(`'${value}' =`)
            .split(`$${key}=`).join(`'${value}' =`)
            .split(`$${key} >`).join(`'${value}' >`)
            .split(`$${key}>`).join(`'${value}' >`)
            .split(`$${key} <`).join(`'${value}' <`)
            .split(`$${key}<`).join(`'${value}' <`);
        };

        if (entry.form.map) {
          const chunks = entry.form.map(f => ({ ...f, condition: acc }))
            .map(f => replace(f.condition, f.key || entry.key, f.value));
          if (chunks.filter(c => c !== acc).length) return chunks.join(' || ');
          return acc;
        }
        return replace(acc, entry.key, entry.form);
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
