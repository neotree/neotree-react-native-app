import { useEffect, useState } from "react";

import { NeotreeConstantsStore } from "@/store/neotree-constants";

export function useNeotreeConstants() {
    const [{ setState, ...constants }, setConstants] = useState(NeotreeConstantsStore.getState());

    useEffect(() => {
        const unsubscribe = NeotreeConstantsStore.subscribe((state) => {
            setConstants(state);
        });
        return () => unsubscribe();
    }, []);

    return constants;
}