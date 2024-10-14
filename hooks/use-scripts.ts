import { useCallback, useEffect, useRef, useState } from "react";

import { Script } from "@/types";

export function useScripts() {
    const mounted = useRef(false);

    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<{ 
        data: Script[]; 
        errors?: string[]; 
    }>({
        data: [],
    });

    const getScripts = useCallback(async () => {
        setLoading(true);
        // TODO: get DB scripts
        // const res = await _getScripts();
        // setScripts(res);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!mounted.current) getScripts();
        mounted.current = true;
    }, [getScripts]);

    return {
        loading,
        scripts,
        getScripts,
    };
}
