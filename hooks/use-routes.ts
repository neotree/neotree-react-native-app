import { useMemo } from "react";
import { usePathname, Href } from "expo-router";

import { Home } from "@/components/svgs/home";
import { Cogs } from "@/components/svgs/settings";
import { Clock } from "@/components/svgs/clock";
import { Location } from "@/components/svgs/Location";
import { QrCode } from "@/components/svgs/qr-code";

export function useRoutes() {
    const pathname = usePathname();

    const routes = useMemo(() => {
        const links: {
            label: string;
            href: Href<string>;
            path: string;
            Icon: React.ComponentType<{ className?: string; svgClassName?: string; }>;
            isActive: boolean;
        }[] = [
            {
                label: 'Home',
                href: '/(drawer)',
                path: '/',
                isActive: pathname === '/',
                Icon: Home,
            },
            {
                label: 'Configuration',
                href: '/(drawer)/configuration',
                path: '/configuration',
                isActive: pathname === '/configuration',
                Icon: Cogs,
            },
            {
                label: 'History',
                href: '/(drawer)/history',
                path: '/history',
                isActive: pathname === '/history',
                Icon: Clock,
            },
            {
                label: 'Location',
                href: '/(drawer)/location',
                path: '/location',
                isActive: pathname === '/location',
                Icon: Location,
            },
            {
                label: 'QR Code',
                href: '/(drawer)/qrcode',
                path: '/qrcode',
                isActive: pathname === '/qrcode',
                Icon: QrCode,
            },
        ];

        return links;
    }, [pathname]);

    return routes;
}