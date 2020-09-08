export default function isDataReady() {
  const {
    syncingData,
    authenticatedUser,
    dataStatus,
    authenticatedUserInitialised
  } = this.state;

  return authenticatedUser ?
    dataStatus ? dataStatus.data_initialised : false
    :
    syncingData ? false : authenticatedUserInitialised;
}
