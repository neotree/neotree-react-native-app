import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import { useContext } from '../Context';
import { ScreenEntry } from '@/src/types';
import * as types from '../../../types';

type ReviewProps = {
    screens: types.Screen[]
    onChange: (index: number,lastPage: types.Screen,lastPageIndex:number) => void;
    lastPage: types.Screen,
    lastPageIndex:number
}

export function ReviewScreen({screens,onChange,lastPage,lastPageIndex}:ReviewProps) {


    const [index, setIndex] = React.useState(-1)

    const opts: any[] = screens.filter(s=>s.type!=='management').map((s: any) => {

        return {
            ...{
                index: screens.indexOf(s),
                title: s?.data?.title
            },
            onChange: (val: number) => handleChange(val)
        };
    });

    const notifyParent = (ind:number) => {
        console.log("--LAS LASTAS..-----",JSON.stringify(lastPage))
          if(ind!=-1){
                onChange(ind,lastPage,lastPageIndex); 
            }
       }

       const handleChange = (ind:number)=>{
        setIndex(ind)
        if(ind!=-1){
        notifyParent(ind)
        }
       }


    return (
        <>
            <Box>
                <Text
                    color="primaryContrastText"
                >SCREEN REVIEW PAGE</Text>
            </Box>

            <Box>
                {opts.map(o => {
                    const isSelected = `${o.index}` === `${index}`;

                    return (
                        <React.Fragment key={o.index}>
                            <TouchableOpacity
                                onPress={() => o.onChange(o.index)}
                            >
                                <Card backgroundColor={isSelected ? 'primary' : undefined}>
                                    <Text
                                        color={isSelected ? 'primaryContrastText' : undefined}
                                        textAlign="center"
                                        variant="title3"
                                    >{o.title}</Text>
                                </Card>
                            </TouchableOpacity>

                            <Br spacing="l" />
                        </React.Fragment>
                    )
                })}
            </Box>
        </>
    );
}
