import { useCallback, useEffect, useRef, useState } from "react";

import { useAppContext } from "@/contexts/app";
import { Script } from "@/types";

export function useScripts() {
    const { getScripts: _getScripts } = useAppContext();

    const mounted = useRef(false);

    const [scripts, setScripts] = useState<{ 
        data: Script[]; 
        errors?: string[]; 
    }>({
        data: [],
    });

    const getScripts = useCallback(async () => {
        const res = await _getScripts();
        setScripts(res);
    }, [_getScripts]);

    useEffect(() => {
        if (!mounted.current) getScripts();
        mounted.current = true;
    }, [getScripts]);

    return {
        scripts,
        getScripts,
    };
}
