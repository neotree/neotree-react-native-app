import clsx from "clsx";
import Svg, { Line, Path, SvgProps } from "react-native-svg";

export type ChevronProps = SvgProps & {
    svgClassName?: string;
    direction: 'left' | 'right' | 'up' | 'down';
};

export function Chevron({ direction, svgClassName, ...props }: ChevronProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    if (direction === 'up') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </Svg>   
        );
    }

    if (direction === 'down') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </Svg> 
        );
    }

    if (direction === 'left') {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </Svg>
        )
    }

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </Svg>
    );
}