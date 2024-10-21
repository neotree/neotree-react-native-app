import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type MenuProps = SvgProps & {
    svgClassName?: string;
    bars?: 2 | 3;
};

export function Menu({ bars, svgClassName, ...props }: MenuProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    if (bars === 2) {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </Svg>
        );
    }

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </Svg>
    );
}