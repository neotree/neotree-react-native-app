import React from "react";
import { useTheme } from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native"
import { Text } from "../../components/Theme"
import { reportErrors } from "../../data/api"
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    ERROR_CORRECTION,
    ALIGN
} from "tp-react-native-bluetooth-printer";
import { Button } from "../Button";

type PrintBarCodeProps = {
    session: any;
    isGeneric?: boolean;
};
export function PrintBarCode({ session,isGeneric}: PrintBarCodeProps) {
    const theme = useTheme();
    const [printer, setPrinter] = React.useState<any>(null);
    const [printing, setPrinting] = React.useState(false)
    const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false)
    const [connecting,setConnecting] = React.useState(false)



    const showPrintingError = (error: any) => {

        {
            Alert.alert(
                'Printer Not Connected:',
                error,
                [
                    {
                        text: 'CANCEL',
                    },
                    {
                        text: 'RETRY?',
                        onPress: () => connectBlueTooth(),
                    }
                ]
            );
        }

    }
    const connectToPrinter = async (onStart: boolean) => {
        try {
               setConnecting(true)
               if(bluetoothEnabled){
                const scannedDevices = await BluetoothManager.scanDevices();
                if (!scannedDevices) {
                   if(!onStart){
                    showPrintingError("NO CONNECTED PRINTERS FOUND.")
                   }
                    
                } else {
                    const scanned = JSON.parse(String(scannedDevices))
                    //TO MAKE THIS CONFIGURABLE
                    const barCodePrinter = Array.from(scanned.paired).filter((b: any) => (b.name.toUpperCase().includes('BT-58L')))
                    if (!barCodePrinter) {
                        if(!onStart){
                        showPrintingError("BT-58L LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                        }

                    } else {
                        return setPrinter(barCodePrinter[0])
                    }
                }

            }else{
                if(!onStart){
                showPrintingError("BLUE TOOTH NOT ENABLED. PUT BLUETOOTH ON AND PRESS RETRY")
                }
            }

        } catch (e: any) {
            if(!onStart){
            showPrintingError(e.message)
            reportErrors("QR_CODE_PRINTING", e)
            }
        }finally{
            setConnecting(false)
        }
    }

    const connectBlueTooth = async () =>{
        const enabled = await BluetoothManager.enableBluetooth()
        if (!enabled) {
            const isNowEnabled = await BluetoothManager.isBluetoothEnabled()
           if(isNowEnabled){
            setBluetoothEnabled(isNowEnabled)
           }
        } else{
            setBluetoothEnabled(true)
        }
    }

    React.useEffect(() => {
        const fetchPrinterDetails = async () => {
                await connectBlueTooth() 
                if(bluetoothEnabled){
                await connectToPrinter(true)
                }

        };
        fetchPrinterDetails();
    }, [bluetoothEnabled]);

    const print = async () => {
        setPrinting(true)
        if (!printer) {
            await connectToPrinter(false)
        }
        try {
            if (printer) {
                await BluetoothManager.connect(printer.address)
                await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER)
                    await BluetoothEscposPrinter.printQRCode(session ? session['uid'] : "NO-UID", 150, ERROR_CORRECTION.M, 0)
                    await BluetoothEscposPrinter.printText(session ? session['uid'] : "NO-UID", {})
                    await BluetoothEscposPrinter.printText("\n", {})
                    await BluetoothEscposPrinter.printerInit()
            }
        } catch (e: any) {
            showPrintingError(e.message)

        } finally {
            setPrinting(false)

        }
    }
    return (
        <>
           {isGeneric? 
            <Button
            hitSlop={{bottom: 20, left: 20, right: 20}}
            style={printer?{ alignItems: 'center', backgroundColor: theme.colors.primary}:
            (bluetoothEnabled?{ alignItems: 'center', width: 'auto',backgroundColor: "blue"}
            :{ alignItems: 'center', width:'auto',backgroundColor: theme.colors.error})}
            disabled={printing || !session || connecting}
            onPress={print}
        >
            {printing||connecting ? <ActivityIndicator size={24} color={theme.colors.primary} /> : (printer?<Text color={'white'}>Print QR Code</Text>
            :<Text color={'white'}>Connect Printer</Text>)}
              </Button>
           :<TouchableOpacity
                onPress={print}
                disabled={printing || !session}
                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                style={{ alignItems: 'flex-start'}}
            >
                {!printing && !connecting? (printer ? <Icon color={theme.colors.primary} size={40} name="qr-code" />
                    : (bluetoothEnabled ? <Icon color={"blue"} size={40} name="qr-code" />
                        : <Icon color={theme.colors.error} size={40} name="qr-code" />))
                    : (
                        <ActivityIndicator
                            color={theme.colors.primary}
                            size={theme.textVariants.title1.fontSize}
                        />
                    )}
            </TouchableOpacity>
            }

        </>
    );


}