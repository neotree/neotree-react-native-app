export default function init({
  state,
  setState,
  router,
  dataContext,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
  this.dataContext = dataContext;

  const {
    state: {
      authenticatedUser,
      authenticatedUserInitialised
    }
  } = this.dataContext;

  this.authenticatedUser = authenticatedUser;
  this.authenticatedUserInitialised = authenticatedUserInitialised;
  this.appIsReady = this.isAppReady();
  this.splashScreen = this.getSplashScreenInfo();
}
