import copy from '@/constants/copy';

export default function getSplashScreenInfo() {
  const { syncingData } = this.state;
  const text = syncingData ? copy.SYNCING_DATA_TEXT : '';
  return {
    display: !this.isAppReady() || this.state.displaySplashScreen,
    text: this.state.splashScreenText || text,
  };
}
