import { Image, ImageProps } from 'react-native';

import { IMAGES } from '@/constants/assets';
import { cn } from '@/lib/utils';

type LogoProps = Omit<ImageProps, 'source' | 'src' | 'srcSet' | 'width' | 'height'> & {
    size?: 'small' | 'large';
};

export function Logo({
    className,
    size,
    ...props
}: LogoProps) {
    return (
        <Image 
            {...props}
            source={IMAGES.logo.url}
            width={IMAGES.logo.width}
            height={IMAGES.logo.height}
            className={cn(
                'w-72 h-72',
                size === 'small' && 'w-24 h-24',
                size === 'large' && 'w-72 h-72',
                className,
            )}
        />
    );
}