import { View, type ViewProps } from "react-native";

import { Typography, type TypographyProps, } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type CardProps = ViewProps & {
    as?: React.ComponentType<ViewProps>;
};

export type CardContentProps = ViewProps & {
    as?: React.ComponentType<ViewProps>;
};

export type CardDescriptionProps = TypographyProps;

export type CardFooterProps = ViewProps & {
    as?: React.ComponentType<ViewProps>;
};

export type CardHeaderProps = ViewProps & {
    as?: React.ComponentType<ViewProps>;
};

export type CardTitleProps = TypographyProps;

export function Card({
    className,
    as: Component = View,
    ...props
}: CardProps) {
    return (
        <Component
            {...props}
            className={cn(
                "border border-border rounded-lg bg-background",
                className,
            )}
        />
    )
}

export function CardContent({
    className,
    as: Component = View,
    ...props
}: CardContentProps) {
    return (
        <Component
            {...props}
            className={cn(
                'p-4',
                className,
            )}
        />
    )
}

export function CardDescription({
    className,
    ...props
}: CardDescriptionProps) {
    return (
        <Typography
            {...props}
            className={cn(
                '',
                className,
            )}
        />
    )
}

export function CardFooter({
    className,
    as: Component = View,
    ...props
}: CardFooterProps) {
    return (
        <Component
            {...props}
            className={cn(
                'pt-4 flex-row gap-x-2',
                className,
            )}
        />
    )
}

export function CardHeader({
    className,
    as: Component = View,
    ...props
}: CardHeaderProps) {
    return (
        <Component
            {...props}
            className={cn(
                'pb-4',
                className,
            )}
        />
    )
}

export function CardTitle({
    className,
    ...props
}: CardTitleProps) {
    return (
        <Typography
            {...props}
            className={cn(
                '',
                className,
            )}
        />
    )
}
