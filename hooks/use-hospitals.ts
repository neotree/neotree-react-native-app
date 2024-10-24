import { useEffect, useRef } from "react";
import { create } from "zustand";

import { DataResponse, Hospital } from "@/types";
import logger from "@/lib/logger";
import { getAxiosClient } from "@/lib/axios";
import { useNetInfo } from "@/hooks/use-netinfo";

type HospitalsState = {
    hospitalsInitialised: boolean;
    hospitalsLoading: boolean;
    hospitals: DataResponse<Hospital[]>['data'];
    loadHospitalsErrors: string[];
    currentHospitalName: string;
    currentHospitalId: string;
};

type HospitalsStore = HospitalsState & {
    reset: () => void;
    setHospitalsState: (partialState: Partial<HospitalsState>) => void;
    getHospitals: () => Promise<void>;
};

const defaultState: HospitalsState = {
    hospitalsInitialised: false,
    hospitalsLoading: false,
    hospitals: [],
    loadHospitalsErrors: [],
    currentHospitalName: '',
    currentHospitalId: '',
};


export const useHospitals = create<HospitalsStore>(set => {
    const setHospitalsState: HospitalsStore['setHospitalsState'] =  partialState => set(prev => ({
        ...prev,
        ...partialState,
    }));

    const getHospitals = async () => {
        try {
            const hasInternet = useNetInfo.getState().hasInternet;
            if (hasInternet) {
                setHospitalsState({ hospitalsLoading: true, });
                const axios = await getAxiosClient();
                const res = await axios.get<DataResponse<Hospital[]>>('/api/hospitals');
                const { data, errors } = res.data;
                setHospitalsState({ 
                    loadHospitalsErrors: errors,
                    hospitals: data || [], 
                });
            }
        } catch(e: any) {
            logger.error('getHospitals ERROR', e.message);
            setHospitalsState({ loadHospitalsErrors: [e.message], });
        } finally {
            setHospitalsState({ hospitalsLoading: false, hospitalsInitialised: true, });
        }
    };

    return {
        ...defaultState,
        reset: () => set(defaultState),
        setHospitalsState,
        getHospitals,
    };
});

export function useHospitalsInitialiser() {
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) useHospitals.getState().getHospitals();
    }, []);
}
