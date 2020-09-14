import copy from '@/constants/copy';

export default function getSplashScreenInfo() {
  const { syncingData, appInitialised } = this.state;
  const text = syncingData ? copy.SYNCING_DATA_TEXT : '';
  return {
    display: !appInitialised || this.state.displaySplashScreen,
    text: this.state.splashScreenText || text,
  };
}
