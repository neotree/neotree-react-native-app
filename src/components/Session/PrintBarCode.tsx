import React from "react";
import { useTheme } from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Alert, TouchableOpacity, PermissionsAndroid, Platform } from "react-native"
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
export function PrintBarCode({ session, isGeneric }: PrintBarCodeProps) {
    const theme = useTheme();

    const [printer, setPrinter] = React.useState<any>(null);
    const [printing, setPrinting] = React.useState(false)
    const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false)
    const [connecting, setConnecting] = React.useState(false)
    const [printerConnected, setPrinterConnected] = React.useState(false)
    const [granted, setGranted] = React.useState(false)



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
                        onPress: () => connectBlueTooth(true),
                    }
                ]
            );
        }

    }

    const retryPrinterConnection = (error: any) => {

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
                        onPress: () => connectToPrinter(false),
                    }
                ]
            );
        }

    }

    const requestBlueToothPermissions = async () => {

        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            if (result && result["android.permission.ACCESS_FINE_LOCATION"] === 'granted') {
                setGranted(true)
            } else {

            }

        }
    }

    const connectToPrinter = async (onStart: boolean) => {
        try {
            if (!granted) {
                await requestBlueToothPermissions()
            } else {


                if (bluetoothEnabled) {
                    if (!onStart) {
                        setConnecting(true)
                    }
                    const scannedDevices = await BluetoothManager.scanDevices();
                    if (!scannedDevices) {
                        if (!onStart) {
                            showPrintingError("NO CONNECTED PRINTERS FOUND.")
                        }

                    } else {
                        const scanned = JSON.parse(String(scannedDevices))
                        //TO MAKE THIS CONFIGURABLE
                        const barCodePrinters = Array.from(scanned.paired).filter((b: any) => (b.name.toUpperCase().includes('BT-58L')))
                        if (!barCodePrinters) {
                            if (!onStart) {
                                retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                                setConnecting(false)
                            }

                        } else {
                            const connectedDevices = await BluetoothManager.getConnectedDevice()
                            const connectedDevice = barCodePrinters?.filter((element: any) =>
                                connectedDevices?.filter((f: any) => f.address === element.address))
                            if (connectedDevice && connectedDevice.length > 0) {
                                setPrinter(connectedDevice[0])
                                setPrinterConnected(true)
                                setConnecting(false)
                            } else {

                                retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                                setConnecting(false)

                            }
                        }
                    }

                } else {
                    if (!onStart) {
                        showPrintingError("BLUE TOOTH NOT ENABLED. PUT BLUETOOTH ON AND PRESS RETRY")
                        setConnecting(false)
                    }
                }
            }

        } catch (e: any) {
            if (!onStart) {
                showPrintingError(e.message)
                setConnecting(false)
            }
        }
    }

    const connectBlueTooth = async (onStart: boolean) => {
        try{
        if (granted) {
            if (onStart) {
                setConnecting(true)
            }
            const isBlueToothEnabled = await BluetoothManager.isBluetoothEnabled()
            if (!isBlueToothEnabled) {
                await BluetoothManager.enableBluetooth()
            }
            setBluetoothEnabled(await BluetoothManager.isBluetoothEnabled())
        } else {
            await requestBlueToothPermissions()
        }
    }catch(e){

    }finally{
        setConnecting(false)
    }
    }

    React.useEffect(() => {

        if (granted) {
            const connectBT = async () => await connectBlueTooth(false)
            connectBT()
        } else {
            const requestPermissions = async () => {
                await requestBlueToothPermissions()
            }
            requestPermissions()
        }
    }, [granted]);


    const print = async () => {
        setPrinting(true)
        if (!printer || !printerConnected) {
            await connectToPrinter(false)
        }
        try {
            if (printerConnected) {
                await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER)
                await BluetoothEscposPrinter.printQRCode(session ? session['uid'] : "NO-UID", 150, ERROR_CORRECTION.M, 0)
                await BluetoothEscposPrinter.printText(session ? session['uid'] : "NO-UID", {})
                await BluetoothEscposPrinter.printText("\n", {})
                await BluetoothEscposPrinter.printerInit()
            }
        } catch (e: any) {
            showPrintingError(e.message)
            reportErrors(e)

        } finally {
            setPrinting(false)

        }
    }
    return (
        <>
            {isGeneric ?
                <Button
                    hitSlop={{ bottom: 20, left: 20, right: 20 }}
                    style={printerConnected ? { alignItems: 'center', backgroundColor: theme.colors.primary } :
                        (bluetoothEnabled ? { alignItems: 'center', width: 'auto', backgroundColor: "blue" }
                            : { alignItems: 'center', width: 'auto', backgroundColor: theme.colors.error })}
                    disabled={printing || !session || connecting}
                    onPress={print}
                >
                    {printing || connecting ? <ActivityIndicator size={24} color={theme.colors.primary} /> : (printerConnected ? 'Print QR Code' :
                        'Connect Printer')}
                </Button>
                : <TouchableOpacity
                    onPress={print}
                    disabled={printing || !session}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={{ alignItems: 'flex-start' }}
                >
                    {!printing && !connecting ? (printerConnected ? <Icon color={theme.colors.primary} size={40} name="qr-code" />
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