import React from "react";
import * as ExpoPrint from 'expo-print';
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import formToHTML from './formToHTML';
import { printSectionsToHTML } from "./printSectionsToHTML";
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
        try {
            setPrinting(true);
        
            let html = formToHTML(session, showConfidential);

            const printSectionsHTML = await printSectionsToHTML({ session, showConfidential });
            if (printSectionsHTML) html = printSectionsHTML;

            await ExpoPrint.printAsync({ html });
        } catch(e: any) {
            setPrintingError(e);
        } finally {
            setPrinting(false);
        }
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
