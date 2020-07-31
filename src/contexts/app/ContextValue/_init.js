export default function init({
  state,
  setState,
  router,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
  this.dataIsReady = this.isDataReady();

  const {
    authenticatedUser,
    authenticatedUserInitialised
  } = this.state;

  this.authenticatedUser = authenticatedUser;
  this.authenticatedUserInitialised = authenticatedUserInitialised;
  this.appIsReady = this.isAppReady();
  this.splashScreen = this.getSplashScreenInfo();
}
