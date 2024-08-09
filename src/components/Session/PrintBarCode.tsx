import React from "react";
import { useTheme} from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import {ActivityIndicator, ToastAndroid} from "react-native"
import {Button} from "../../components/Button"
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
    const [printing, setPrinting] = React.useState(false)


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
    const showPrintingError = ()=>
          {
            ToastAndroid.show(error,ToastAndroid.LONG)
    }
    const connectToPrinter = async () => {
        try {
            let barCodePrinter = null;

            if (!BluetoothManager.isBluetoothEnabled()) {
                await BluetoothManager.enableBluetooth();
            }
            const scannedDevices = await BluetoothManager.getConnectedDevice();
            if (!scannedDevices || scannedDevices.length <= 0) {
                setError("PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE." )
            } else {
                //TO MAKE THIS CONFIGURABLE
                barCodePrinter = scannedDevices.filter(b => (b.name.toUpperCase().includes('BT-58L')))
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
    }, [printer]);

    const print = async () => {
        setPrinting(true)
        if(!printer){
           await connectToPrinter()
        }
        try {
            if(printer){
            await BluetoothManager.connect(printer.address)
            await BluetoothTscPrinter.printLabel(options)
            }
        } catch (e: any) {
            setError(e.message)

        } finally{
            setPrinting(false)
            if(error){
                showPrintingError()
                setError(null)
            }
        }
    }
    return (
           <>
			<Button
            onPress={print}
            disabled={printing}
            textStyle={{ textTransform: 'uppercase', }}
            size="s"
        
            style={{ alignItems: 'flex-start',width:50,backgroundColor:theme.colors["grey-800"]}}
            >
            {!printing ? (printer ?  <Icon color={theme.colors.primary} size={30} name="qr-code" /> 
            :  <Icon color={theme.colors.error} size={30} name="qr-code" />) : (
                <ActivityIndicator 
                    color={theme.colors.primary}
                    size={theme.textVariants.title1.fontSize}
                />
            )}
        </Button>  
      
        </>
    );


}