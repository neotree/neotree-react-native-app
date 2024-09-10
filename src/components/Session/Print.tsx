import React from "react";
import * as ExpoPrint from 'expo-print';
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import formToHTML from './formToHTML';

import { useTheme } from "../Theme";

type PrintSessionProps = {
    session: any;
    showConfidential?: boolean;
};

export function PrintSession({ session, showConfidential }: PrintSessionProps) {
    const theme = useTheme();

    const [, setPrinting] = React.useState(false);
    const [, setPrintingError] = React.useState(false);

    const print = async () => {
        setPrinting(true);
        
        ExpoPrint.printAsync({ html: await formToHTML(session, showConfidential) })
            .then(() => setPrinting(false))
            .catch(e => {
            setPrinting(false);
            setPrintingError(e);
            });
    };
    
    return (
        <TouchableOpacity
            style={{ paddingHorizontal: 10 }}
            onPress={() => print()}
        >
            <Icon color={theme.colors.primary} size={24} name="print" />
        </TouchableOpacity>
    )
}
