import { type TextProps as RNTextProps, Text as RNText } from 'react-native';

import { cn } from '@/lib/utils';
import { useButtonContext } from './button';

export type TypographyProps = RNTextProps;

export function Typography({ className, ...props }: TypographyProps) {
    const btnCtx = useButtonContext();

    return (
        <RNText
            {...props}
            className={cn(
                'text-base text-typography',
                btnCtx && 'text-primary-foreground',
                btnCtx?.color === 'danger' && 'text-destructive-foreground',
                btnCtx?.color === 'secondary' && 'text-secondary-foreground',
                btnCtx?.variant === 'outline' && 'text-typography',
                btnCtx?.variant === 'outline' && btnCtx?.color === 'primary' && 'text-primary',
				btnCtx?.variant === 'outline' && btnCtx?.color === 'danger' && 'text-destructive',
                btnCtx?.variant === 'outline' && btnCtx?.color === 'secondary' && 'text-secondary',
                className,
            )}
        />
    );
}
