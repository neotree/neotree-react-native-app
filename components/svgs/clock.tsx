import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type ClockProps = SvgProps & {
    svgClassName?: string;
};

export function Clock({ svgClassName, ...props }: ClockProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </Svg>    
    );
}