import React from "react";
import * as ExpoPrint from 'expo-print';
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import formToHTML from './formToHTML';
import { printSectionsToHTML } from "./printSectionsToHTML";
import { useTheme } from "../Theme";
import { OverlayLoader } from "../OverlayLoader";

type PrintSessionProps = {
    session: any;
    showConfidential?: boolean;
};

export function PrintSession({ session, showConfidential }: PrintSessionProps) {
    const theme = useTheme();

    const [printing, setPrinting] = React.useState(false);
    const [, setPrintingError] = React.useState(false);
  
    const print = async () => {
        try {
            setPrinting(true);
            let html = await formToHTML(session, showConfidential);
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
        <>
            {printing && <OverlayLoader transparent backgroundColor="rgba(255,255,255,.5)" />}

            <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => print()}
                disabled={printing}
            >
                <Icon color={theme.colors.secondary} size={24} name="print" />
            </TouchableOpacity>
        </>
    )
}
