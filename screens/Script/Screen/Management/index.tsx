import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Text, Br, View } from '@/components/ui';
import { Image } from '@/components/Image';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../types';

export function Management(props: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();

    const sections = [
        { 
            title: activeScreen.data?.metadata?.title1, 
            text: activeScreen.data?.metadata?.text1,
            image: activeScreen.data?.metadata?.image1?.data,
        },
        { 
            title: activeScreen.data?.metadata?.title2, 
            text: activeScreen.data?.metadata?.text2,
            image: activeScreen.data?.metadata?.image2?.data,
        },
        { 
            title: activeScreen.data?.metadata?.title3, 
            text: activeScreen.data?.metadata?.text3,
            image: activeScreen.data?.metadata?.image3?.data,
        },
    ].filter(s => s.text || s.title || s.image);

    return (
        <>
            {sections.map((s, i)=> (
                <React.Fragment key={i}>
                    <View variant="elevated">
                        <TouchableOpacity 
                            style={{ padding: theme.spacing(), }}
                        >
                            {!!s.title && (
                                <>
                                    <Text variant="subtitle1">{s.title}</Text>
                                    <Br />
                                </>
                            )}
                            {!!s.text && (
                                <>
                                    <Text>{s.text}</Text>
                                    <Br />
                                </>
                            )}
                            {!!s.image && (
                                <Image
                                    fullWidth
                                    resizeMode="contain"
                                    source={{ uri: s.image }}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Br />
                </React.Fragment>
            ))}
        </>
    );
}
