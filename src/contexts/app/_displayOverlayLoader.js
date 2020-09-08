export default function displayOverlayLoader() {
  return Object.keys(this.state.overlayLoaderState)
    .reduce((acc, key) => {
      if (this.state.overlayLoaderState[key]) acc = true;
      return acc;
    }, false);
}
