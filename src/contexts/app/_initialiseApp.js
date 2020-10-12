export default function _initialiseApp() {
  (async () => {
    this.setState({ appInitialised: false, initialisingApp: true, });
    let authenticatedUser = null;

    this.addSocketEventsListeners();

    try { await this.loadFonts(); } catch (e) { /* Do nothing */ }

    try { 
      const { authenticatedUser: u } = await this.sync(); 
      authenticatedUser = u;
    } catch (e) { /* Do nothing */ }

    this.router.history.entries = [];
    this.router.history.push(authenticatedUser ? '/' : '/sign-in');

    this.setState({ appInitialised: true, initialisingApp: false, });
  })();
}
