import clsx from "clsx";
import Svg, { Path, SvgProps } from "react-native-svg";

export type ExclamationProps = SvgProps & {
    svgClassName?: SvgProps['className'];
    triange?: boolean;
};

export function Exclamation({ triange, svgClassName, ...props }: ExclamationProps) {
    const className = clsx(
        'w-4 h-4 stroke-black',
        props?.className,
        svgClassName,
    );

    if (triange) {
        return (
            <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </Svg>
        );
    }

    return (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className={className}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </Svg>      
    );
}