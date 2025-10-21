import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

export function ReviewScreen({ screens, onChange, lastPage, lastPageIndex, onSkip }: ReviewProps) {


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
        if (ind !== null) {
            notifyParent(ind)
        }
    }

    React.useEffect(() => {
        Keyboard.dismiss();
    }, []);
    


    return (
        <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
        >
            <Box style={styles.headerContainer}>
                <Text
                    color="primaryContrastText"
                >SCREEN REVIEW PAGE</Text>
            </Box>

            <Box style={styles.contentContainer}>
                {opts.map((o: any) => {
                    const isSelected = `${o.index}` === `${index}`;
               
                    return (
                        <React.Fragment key={o.index}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={() => o.onChange(o.index)}
                            >
                                <Box style={styles.card}>
                                    <Card backgroundColor={'primaryContrastText'}>
                                        <Text
                                            color={isSelected ? 'primaryContrastText' : 'grey-900'}
                                            textAlign="center"
                                            variant="title3"
                                        >{o.title}</Text>
                                    </Card>
                                </Box>
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
        </ScrollView>
    );
}



const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    optionButton: {
        width: '100%',
    },
    card: {
        width: '100%',
        minHeight: 60,
        justifyContent: 'center',
    },
    skipButton: {
        backgroundColor: 'maroon',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 60,
        marginTop: 10,
    },
    skipButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});