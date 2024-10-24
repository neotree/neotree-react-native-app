import { create } from 'zustand';
import { NetInfoState as RNNetInfoState, addEventListener, fetch } from '@react-native-community/netinfo';

type NetInfoState = RNNetInfoState & {
    hasInternet: boolean;
    netInfoInitialised: boolean;
};

type NetInfoStore = NetInfoState & {
    init: () => Promise<void>;
};

const defaultState: NetInfoState = {
    isConnected: null,
    isInternetReachable: null,
    details: null,
    type: null!,
    isWifiEnabled: true,
    netInfoInitialised: false,
    hasInternet: false,
};

export const useNetInfo = create<NetInfoStore>((set) => {
    const setState = (netInfo: RNNetInfoState) => set({ 
        ...netInfo, 
        hasInternet: !!(netInfo.isConnected && netInfo.isInternetReachable),
        netInfoInitialised: true,
    });

    return {
        ...defaultState,
        async init(){
            const netInfo = await fetch();
            setState(netInfo)
            addEventListener(netInfo => setState(netInfo));
        }
    };
});