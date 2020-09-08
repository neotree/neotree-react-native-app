export default function _initialiseApp() {
  this.addSocketEventsListeners();

  this.setState({ appInitialised: false, initialisingApp: true, })

  const done = () => this.setState({ appInitialised: true, initialisingApp: false, });

  Promise.all([
    this.loadFonts(),
    this.initialiseData(),
  ]).then(done).catch(done);
}
