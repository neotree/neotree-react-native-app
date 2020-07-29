export default function onLocationChange() {
  const { screenId } = this.router.match.params;
  const { screensInitialised, } = this.state;

  if (screensInitialised) {
    this.setState(({ screens, form, cachedForm, activeScreen, }) => {
      const targetScreenIndex = screenId ? screens.map(s => s.id.toString()).indexOf(screenId) : 0;
      const targetScreen = screens[targetScreenIndex];
      const cachedEntry = !targetScreen ? null : cachedForm.filter(e => e.screen.id === targetScreen.id)[0];

      return {
        cachedForm: [
          ...cachedForm.filter(cachedEntry => !form.map(entry => entry.screen.id).includes(cachedEntry.screen.id)),
          ...form
        ],
        form: [
          ...form.filter(e => e.screen.id !== activeScreen.id)
            .filter(entry => !(cachedEntry && cachedEntry.screen.id === entry.screen.id)),
          ...(cachedEntry ? [cachedEntry] : []),
        ],
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
