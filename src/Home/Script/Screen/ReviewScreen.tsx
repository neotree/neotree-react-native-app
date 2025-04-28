import React from 'react';
import { TouchableOpacity,StyleSheet } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import * as types from '../../../types';
import { Keyboard } from 'react-native';


type ReviewProps = {
    screens: any
    onChange: (index: number, lastPage: types.Screen, lastPageIndex: number) => void;
    lastPage: types.Screen,
    lastPageIndex: number,
    onSkip: (lastPage: types.Screen, lastPageIndex: number)=>any;
}

export function ReviewScreen({ screens, onChange, lastPage, lastPageIndex,onSkip }: ReviewProps) {


    const [index, setIndex] = React.useState(null)

    const opts = React.useMemo(() => screens.map((s: any) => ({
        ...{
            index: s.screen,
            title: s.label
        },
        onChange: (val: number) => handleChange(val)
    })), [screens]);


    const notifyParent = (ind: any) => {
        if (ind) {
            onChange(ind, lastPage, lastPageIndex);
        }
    }

    const handleChange = (ind: any) => {
        setIndex(ind)
        if (ind !==null) {
            notifyParent(ind)
        }
    }

    React.useEffect(() => {
        Keyboard.dismiss();
    }, []);
    


    return (
        <>
            <Box
            >
                <Text
                    color="primaryContrastText"
                >SCREEN REVIEW PAGE</Text>
            </Box>

            <Box>
                {opts.map((o:any) => {
                    const isSelected = `${o.index}` === `${index}`;
               
                    return (
                        <React.Fragment key={o.index}>
                           <TouchableOpacity
                                onPress={() => o.onChange(o.index)}
                            >
                            <Card backgroundColor={'primaryContrastText'}>
                                <Text
                                    color={isSelected ? 'primaryContrastText' : 'grey-900'}
                                    textAlign="center"
                                    variant="title3"
                                >{o.title}</Text>
                            </Card>

                            </TouchableOpacity>

                            <Br spacing="l" />
                        </React.Fragment>
                    )
                })}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => onSkip(lastPage, lastPageIndex)}
                >
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            </Box>
        </>
    );
}



const styles = StyleSheet.create({
    skipButton: {
        backgroundColor: 'maroon',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    skipButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});