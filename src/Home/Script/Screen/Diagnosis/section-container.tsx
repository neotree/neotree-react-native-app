import { useEffect, useRef } from 'react';
import { OverlayLoader } from '@/src/components';
import * as types from '@/src/types';

type Props = types.DiagnosisSectionProps & {
    children: React.ReactNode;
};

export function SectionContainer({ children, loading, activeDiagnosisIndex, setLoading, }: Props) {
    const mounted = useRef(false);
    
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            setLoading(false);
        }
    }, [setLoading]);

    useEffect(() => {
        if (mounted.current) {
            setLoading(false);
        }
    }, [activeDiagnosisIndex]);

    return (
        <>
            {loading && <OverlayLoader transparent />}
            {children}
        </>
    );
}
