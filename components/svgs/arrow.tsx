import clsx from "clsx";
import Svg, { Line, Path, SvgProps } from "react-native-svg";

export type ArrowProps = SvgProps & {
    svgClassName?: string;
    direction: 'left' | 'right' | 'up' | 'down';
};

export function Arrow({ direction, svgClassName, ...props }: ArrowProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    if (direction === 'up') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </Svg>
        );
    }

    if (direction === 'down') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </Svg>          
        );
    }

    if (direction === 'left') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </Svg>          
        )
    }

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </Svg>      
    );
}