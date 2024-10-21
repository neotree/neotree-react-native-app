import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type LocationProps = SvgProps & {
    svgClassName?: string;
};

export function Location({ svgClassName, ...props }: LocationProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </Svg>      
    );
}