import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type CheckProps = SvgProps & {
    svgClassName?: SvgProps['className'];
    circle?: boolean;
};

export function Check({ circle, svgClassName, ...props }: CheckProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    if (circle) {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </Svg>
        );
    }

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </Svg>         
    );
}