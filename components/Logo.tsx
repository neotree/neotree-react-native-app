import React from 'react';
import { Image, ImageProps } from 'react-native';

export type LogoProps = Omit<ImageProps, 'source'> & {
    size?: 'small' | 'default' | 'large';
    colorScheme?: 'light' | 'dark';
    source?: ImageProps['source'];
};

export const Logo = React.forwardRef(({ style, size, colorScheme, ...props }: LogoProps, ref) => {
    const logoRef = React.useRef(null);
    React.useImperativeHandle(ref, () => logoRef.current);

    const light = require('@/assets/images/logo.png');
    const dark = require('@/assets/images/logo.png');

    return (
        <Image
            source={colorScheme === 'light' ? light : dark}
            {...props}
            ref={logoRef}
            style={[
                {
                    width: size === 'small' ? 50 : (size === 'large' ? 150 : 100),
                    height: undefined,
                    aspectRatio: 361/195
                },
                /* @ts-ignore */
                style && style.map ? style : [style],
            ]}
        />
    );
});
