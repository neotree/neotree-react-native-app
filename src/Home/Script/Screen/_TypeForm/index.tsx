import React from 'react';
import { Box, Br, Text } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';
import { fieldsTypes } from '../../../../constants';

import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField } from './_Period';
import { TimeField } from './_Time';

type TypeFormProps = types.ScreenTypeProps & {
    
};

export function TypeForm({}: TypeFormProps) {
    const ctx = useContext();

    const metadata = ctx?.activeScreen?.data?.metadata;

    return (
        <Box>
            {metadata.fields.map((f: any) => {
                return (
                    <React.Fragment key={f.key}>
                        {(() => {
                            let Component: null | React.ComponentType<types.ScreenFormTypeProps> = null;
                            switch (f.type) {
                            case fieldsTypes.NUMBER:
                                Component = NumberField;
                                break;
                            case fieldsTypes.DATE:
                                Component = DateField;
                                break;
                            case fieldsTypes.DATETIME:
                                Component = DateField;
                                break;
                            case fieldsTypes.DROPDOWN:
                                Component = DropDownField;
                                break;
                            case fieldsTypes.PERIOD:
                                Component = PeriodField;
                                break;
                            case fieldsTypes.TEXT:
                                Component = TextField;
                                break;
                            case fieldsTypes.TIME:
                                Component = TimeField;
                                break;
                            default:
                            // do nothing
                            }

                            if (!Component) return null;

                            return (
                                <>
                                    <Component 
                                        field={f}
                                        conditionMet={true}
                                    />
                                    <Br spacing="xl" />
                                </>
                            );
                        })()}
                    </React.Fragment>
                )
            })}            
        </Box>
    );
}
