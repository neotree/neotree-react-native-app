import React from "react";
import Icon from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import { useTheme,Text } from "../Theme";
import {
    BluetoothManager,
    BluetoothTscPrinter,
    DIRECTION,
    TEAR,
    FONTTYPE,
    TSC_ROTATION,
    FONTMUL,
    EEC
} from "tp-react-native-bluetooth-printer";

type PrintBarCodeProps = {
    session?: any;
};
export function PrintBarCode({session }: PrintBarCodeProps) {
    const theme = useTheme();
    const [error, setError] = React.useState<any>(null);
    const [printer,setPrinter] = React.useState<any>(null);


    let options = {
        width: 40,
        height: 30,
        gap: 20,
        direction: DIRECTION.FORWARD,
        reference: [0, 0],
        tear: TEAR.ON,
        sound: 0,
        text: [
            {
                text: session['uid'],
                x: 20,
                y: 0,
                fonttype: FONTTYPE.SIMPLIFIED_CHINESE,
                rotation: TSC_ROTATION.ROTATION_0,
                xscal: FONTMUL.MUL_1,
                yscal: FONTMUL.MUL_1,
            }
        ],
        qrcode: [
            {
                x: 20,
                y: 96,
                level: EEC.LEVEL_L,
                width: 3,
                rotation: TSC_ROTATION.ROTATION_0,
                code:  session['uid'],
            },
        ],
    };
    const connectToPrinter = async () => {
        try {
            let barCodePrinter = null;

            if (!BluetoothManager.isBluetoothEnabled()) {
                await BluetoothManager.enableBluetooth();
            }
            const scannedDevices = await BluetoothManager.scanDevices();
            if (!scannedDevices || scannedDevices.paired.length == 0) {
                setError("PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE." )
            } else {
                //TO MAKE THIS CONFIGURABLE
                barCodePrinter = scannedDevices.paired.filter(b => b.name == 'BT-58L')
                if (!barCodePrinter) {
                    setError("PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                }

            }
            return barCodePrinter;
        } catch (e: any) {
            setError(e.message )
            return null;
        }
    }

    React.useEffect(() => {
        const fetchPrinterDetails = async () => {
            const details = await connectToPrinter();
            if (details) {
             setPrinter(details);
            }
        };
        fetchPrinterDetails();
    }, [connectToPrinter]);

    const print = async () => {

        try {
            await BluetoothManager.connect(printer.address)
            await BluetoothTscPrinter.printLabel(options)
        } catch (e: any) {
            setError({ message: e.message })

        }
    }
    return (
        <>
        {error? <>
            < Text color={'error'}>{error}</Text>
        </>:
        <>
           {printer ? <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => print()}
                disabled={!printer || error}
            >
                <Icon color={theme.colors.primary} size={24} name="qr-code" />
            </TouchableOpacity>:
            <TouchableOpacity
                style={{ paddingHorizontal: 10 }}
                onPress={() => connectToPrinter()}
                disabled={!printer || error}
            >
                <Icon color={theme.colors.primary} size={24} name="refresh" />
            </TouchableOpacity> }
            
        </>}
        </>
    );


}