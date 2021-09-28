import React from 'react';

export function loadLazyComponent<ComponentProps = React.ComponentProps<any>>(importer: () => Promise<{ default: React.ComponentType }>) {
    return function LazyComponent(props: ComponentProps) {
        const [component, setComponent] = React.useState<React.ReactNode | null>(null);

        React.useEffect(() => {
            (async () => {
                try {
                    const { default: Component } = await importer();
                    setComponent(<Component />);
                } catch (e) { /* DO NOTHING */ }
            })();
        }, []);

        return component;
    }
}
