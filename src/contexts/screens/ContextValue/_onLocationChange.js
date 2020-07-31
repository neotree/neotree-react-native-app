export default function onLocationChange() {
  const { screenId } = this.router.match.params;
  const { screensInitialised, } = this.state;

  if (screensInitialised) {
    this.setState(({ screens, form, cachedForm, activeScreen, activeScreenIndex, }) => {
      const targetScreenIndex = screenId ? screens.map(s => s.id.toString()).indexOf(screenId) : 0;
      const targetScreen = screens[targetScreenIndex];
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
  }
}
