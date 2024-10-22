import { useEffect, useRef } from "react";

import { useSocket } from "@/hooks/use-socket";

export function SocketEventsListener({ events }: {
    events: {
        name: string;
        action?: string;
        delay?: number;
        onEvent: {
            callback?: (...args: any[]) => void;
        };
    }[];
}) {
    const { socket } = useSocket();

    const ref = useRef({
        eventsTimeouts: {} as { [key: string]: ReturnType<typeof setTimeout> },
        eventsTimestamps: {} as { [key: string]: number; },
    });

    const lastEventTimestamp = useRef(new Date().getTime());

    useEffect(() => {
        events.forEach(({ name: eventName, action, delay = 100, onEvent }) => {
            socket?.on?.(eventName, (...args) => {
                const handleEvent = () => {
                    if (action && (args[0] !== action)) return;

                    onEvent.callback?.(...args);
                }

                const timestamp = new Date().getTime();

                if (delay) {
                    clearTimeout(ref.current.eventsTimeouts[eventName]);
                    ref.current.eventsTimeouts[eventName] = setTimeout(() => {
                        ref.current.eventsTimestamps[eventName] = timestamp;
                        handleEvent();
                    }, delay);
                } else {
                    ref.current.eventsTimestamps[eventName] = new Date().getTime();
                    handleEvent();
                }
            });
        });
    }, [events, socket]);

    return null;
}
