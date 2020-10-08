export default function _initialiseApp() {
  (async () => {
    this.setState({ appInitialised: false, initialisingApp: true, });

    this.addSocketEventsListeners();

    try { await this.loadFonts(); } catch (e) { /* Do nothing */ }

    try { await this.sync(); } catch (e) { /* Do nothing */ }

    this.setState({ appInitialised: true, initialisingApp: false, });
  })();
}
