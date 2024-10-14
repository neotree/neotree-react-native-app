import NetInfo from '@react-native-community/netinfo';

export async function isInternetConnected() {
    const netInfo = await NetInfo.fetch();
    return !!(netInfo?.isConnected && netInfo?.isInternetReachable);
}