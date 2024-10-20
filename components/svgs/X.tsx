import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type XProps = SvgProps & {
    svgClassName?: string;
};

export function X({ svgClassName, ...props }: XProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18 18 6M6 6l12 12" 
            />
        </Svg>
    );
}