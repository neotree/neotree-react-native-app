import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

export function useIsScreenFocused() {
    const [focused, setFocused] = useState(false);

    useFocusEffect(useCallback(() => {
        setFocused(true);
        return () => setFocused(false);
    }, []));

    return focused;
}