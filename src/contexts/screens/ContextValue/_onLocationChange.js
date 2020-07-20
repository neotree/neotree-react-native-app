export default function onLocationChange() {
  const { screenId } = this.router.match.params;
  const { screensInitialised, screens } = this.state;

  if (screensInitialised) {
    const activeScreenIndex = screenId ? screens.map(s => s.id.toString()).indexOf(screenId) : 0;
    const activeScreen = screens[activeScreenIndex];
    this.setState({
      activeScreenIndex,
      activeScreenInitialised: true,
      activeScreen: !activeScreen ? null : {
        ...activeScreen,
        data: {
          ...activeScreen.data,
          metadata: {
            ...activeScreen.data.metadata,
            ...(activeScreen.data.metadata || {}).items ?
              { items: activeScreen.data.metadata.items.sort((a, b) => a.position - b.position) }
              :
              null,
            ...(activeScreen.data.metadata || {}).fields ?
              { fields: activeScreen.data.metadata.fields.sort((a, b) => a.position - b.position) }
              :
              null
          }
        }
      },
    });
  }
}
