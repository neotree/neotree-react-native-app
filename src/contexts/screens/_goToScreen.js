export default function goToScreen(direction = 'next') {
  const { history } = this.router;
  const { screensInitialised, } = this.state;

  const {
    getScreen,
    router: { match: { params: { scriptId } } }
  } = this;

  let s = null;
  switch (direction) {
    case 'next':
      s = getScreen({ direction: 'next' });
      break;
    case 'back':
      s = getScreen({ direction: 'back' });
      break;
    case 'initial':
      s = getScreen({ index: 0, });
      break;
    default:
      s = getScreen();
  }

  if (!s) return;

  const { screen: targetScreen, index: targetScreenIndex } = s;
  const link = `/script/${scriptId}/screen/${targetScreen.id}`;

  if (screensInitialised) {
    this.setState(({ form, cachedForm, activeScreen, activeScreenIndex, }) => {
      const cachedEntry = !targetScreen ? null : cachedForm.filter(e => e.screen.id === targetScreen.id)[0];

      const _form = [
        ...form.filter(e => {
          if (activeScreenIndex > targetScreenIndex) return e.screen.id !== activeScreen.id;
          return true;
        }).filter(e => !cachedEntry ? true : e.screen.id !== cachedEntry.screen.id),
        ...(cachedEntry ? [cachedEntry] : []),
      ];

      return {
        cachedForm: [
          ...cachedForm.filter(cachedEntry => !form.map(entry => entry.screen.id).includes(cachedEntry.screen.id)),
          ...form
        ],
        form: _form,
        activeScreenIndex: targetScreenIndex,
        activeScreenInitialised: true,
        activeScreen: !targetScreen ? null : {
          ...targetScreen,
          data: {
            ...targetScreen.data,
            metadata: {
              ...targetScreen.data.metadata,
              ...(targetScreen.data.metadata || {}).items ?
                { items: targetScreen.data.metadata.items.sort((a, b) => a.position - b.position) }
                :
                null,
              ...(targetScreen.data.metadata || {}).fields ?
                { fields: targetScreen.data.metadata.fields.sort((a, b) => a.position - b.position) }
                :
                null
            }
          }
        },
      };
    });

    history.push(link);
  }
}
