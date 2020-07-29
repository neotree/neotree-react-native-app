export default function onLocationChange() {
  const { screenId } = this.router.match.params;
  const { screensInitialised, } = this.state;

  if (screensInitialised) {
    this.setState(({ screens, form, cachedForm, activeScreenIndex, }) => {
      const targetScreenIndex = screenId ? screens.map(s => s.id.toString()).indexOf(screenId) : 0;
      const targetScreen = screens[targetScreenIndex];

      return {
        cachedForm: [
          ...cachedForm.filter(cachedEntry => !form.map(entry => entry.screen.id).includes(cachedEntry.screen.id)),
          ...form
        ],
        activeScreenIndex: targetScreenIndex,
        activeScreenInitialised: true,
        form: form.reduce((acc, e, i) => {
          if ((targetScreenIndex < activeScreenIndex) && (i === (form.length - 1))) return acc;
          return [...acc, e];
        }, []),
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
