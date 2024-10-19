import { useCallback, useEffect, useRef, useState } from "react";

import { DataResponse, Hospital } from "@/types";
import logger from "@/lib/logger";
import { getAxiosClient } from "@/lib/axios";

export function useHospitals(options?: {
    loadHospitalsOnmount?: boolean;
}) {
    const {
        loadHospitalsOnmount,
    } = { ...options, };

    const mounted = useRef(false);

    const [hospitalsInitialised, setHospitalsInitialised] = useState(false);
    const [hospitalsLoading, setLoading] = useState(true);
    const [hospitals, setHospitals] = useState<DataResponse<Hospital[]>>({
        data: [],
    });

    const getHospitals = useCallback(async () => {
        try {
            setLoading(true);
            const axios = await getAxiosClient();
            const res = await axios.get<DataResponse<Hospital[]>>('/api/hospitals');
            const { data } = res.data;
            setHospitals({ data: data || [], });
        } catch(e: any) {
            logger.error('getHospitals ERROR', e.message);
            setHospitals({ errors: [e.message], data: [], })
        } finally {
            setLoading(false);
            setHospitalsInitialised(true);
        }
    }, []);

    useEffect(() => {
        if (loadHospitalsOnmount && !mounted.current) getHospitals();
    }, [loadHospitalsOnmount, getHospitals]);

    useEffect(() => { mounted.current = true; }, []);

    return {
        hospitalsInitialised,
        hospitalsLoading,
        hospitals: hospitals.data,
        loadHospitalsErrors: hospitals.errors,
        getHospitals,
    };
}
