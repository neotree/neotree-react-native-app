import React from "react";
import * as ExpoPrint from 'expo-print';
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import formToHTML from './formToHTML';
import { printSectionsToHTML } from "./printSectionsToHTML";
import { useTheme } from "../Theme";
import { OverlayLoader } from "../OverlayLoader";
import { getSessionPrintBlockMessage, isSessionPrintable } from "./printEligibility";
import { PrintBlockedDialog } from "./PrintBlockedDialog";

type PrintSessionProps = {
    session: any;
    showConfidential?: boolean;
};

export function PrintSession({ session, showConfidential }: PrintSessionProps) {
    const theme = useTheme();

    const [printing, setPrinting] = React.useState(false);
    const [, setPrintingError] = React.useState(false);
    const [showBlockedDialog, setShowBlockedDialog] = React.useState(false);
    const printable = isSessionPrintable(session);

    const print = async () => {
        if (!printable) {
            setShowBlockedDialog(true);
            return;
        }

        try {
            setPrinting(true);
            let html = await formToHTML(session, showConfidential);
            const printSectionsHTML = await printSectionsToHTML({ session, showConfidential });

            if (printSectionsHTML) html = printSectionsHTML;

            await ExpoPrint.printAsync({ html, height: 1122, });
        } catch (e: any) {
            setPrintingError(e);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <>
            {printing && <OverlayLoader transparent backgroundColor="rgba(255,255,255,.5)" />}
            <PrintBlockedDialog
                open={showBlockedDialog}
                message={getSessionPrintBlockMessage(session)}
                onClose={() => setShowBlockedDialog(false)}
            />

            <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => print()}
                disabled={printing}
            >
                <Icon
                    color={printable ? theme.colors.secondary : theme.colors.textDisabled}
                    size={24}
                    name="print"
                />
            </TouchableOpacity>
        </>
    )
}
