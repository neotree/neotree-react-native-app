import { useCallback, useEffect, useRef, useState } from "react";

import { db, hospitals as hospitalsTable } from "@/database";
import { DataResponse } from "@/types";
import logger from "@/lib/logger";

export function useHospitals(options?: {
    loadHospitalsOnmount?: boolean;
}) {
    const {
        loadHospitalsOnmount,
    } = { ...options, };

    const mounted = useRef(false);

    const [hospitalsInitialised, setHospitalsInitialised] = useState(false);
    const [hospitalsLoading, setLoading] = useState(true);
    const [hospitals, setHospitals] = useState<DataResponse<typeof hospitalsTable.$inferSelect[]>>({
        data: [],
    });

    const getHospitals = useCallback(async () => {
        try {
            setLoading(true);
            const res = await db.select().from(hospitalsTable);
            setHospitals({ data: res, });
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
