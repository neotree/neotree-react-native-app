import copy from '@/constants/copy';

export default function getSplashScreenInfo() {
  const { state: { syncingData } } = this.dataContext;
  const text = syncingData ? copy.SYNCING_DATA_TEXT : '';
  return {
    display: !this.isAppReady() || this.state.displaySplashScreen,
    text: this.state.splashScreenText || text,
  };
}
