import { useCallback, useEffect, useRef, useState } from "react";

import { db, sites as sitesTable } from "@/data";
import { DataResponse } from "@/types";
import logger from "@/lib/logger";

export function useSites(options?: {
    loadSitesOnmount?: boolean;
}) {
    const {
        loadSitesOnmount,
    } = { ...options, };

    const mounted = useRef(false);

    const [sitesInitialised, setSitesInitialised] = useState(false);
    const [sitesLoading, setLoading] = useState(true);
    const [sites, setSites] = useState<DataResponse<typeof sitesTable.$inferSelect[]>>({
        data: [],
    });

    const getSites = useCallback(async () => {
        try {
            setLoading(true);
            const res = await db.select().from(sitesTable);
            setSites({ data: res, });
        } catch(e: any) {
            logger.error('getSites ERROR', e.message);
            setSites({ errors: [e.message], data: [], })
        } finally {
            setLoading(false);
            setSitesInitialised(true);
        }
    }, []);

    useEffect(() => {
        if (loadSitesOnmount && !mounted.current) getSites();
    }, [loadSitesOnmount, getSites]);

    useEffect(() => { mounted.current = true; }, []);

    return {
        sitesInitialised,
        sitesLoading,
        sites: sites.data,
        loadSitesErrors: sites.errors,
        getSites,
    };
}
