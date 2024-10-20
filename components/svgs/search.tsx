import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type SearchProps = SvgProps & {
    svgClassName?: string;
};

export function Search({ svgClassName, ...props }: SearchProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    return (
        <Svg 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            className={className}
        >
            <Path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
            />
        </Svg>
    );
}