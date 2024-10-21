import { useEffect } from "react";
import { router } from "expo-router";

export function Redirect({ href, replace }: { href: string; replace?: boolean; }) {
    useEffect(() => {
        const fn = replace ? router.replace : router.push;
        fn(href);
    }, [href, replace]);
    return null;
}