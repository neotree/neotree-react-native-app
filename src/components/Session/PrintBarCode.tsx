import React from "react";
import { useTheme} from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import {ActivityIndicator, Alert} from "react-native"
import {Button} from "../../components/Button"
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    ERROR_CORRECTION,
    ALIGN
} from "tp-react-native-bluetooth-printer";

type PrintBarCodeProps = {
    session?: any;
};
export function PrintBarCode({session }: PrintBarCodeProps) {
    const theme = useTheme();
    const [printer,setPrinter] = React.useState<any>(null);
    const [printing, setPrinting] = React.useState(false)



    const showPrintingError = (error:any)=>{
    
          {
            Alert.alert(
                'Printer Not Connected:',
                  error,
                [
                    {
                        text: 'Cancel',
                    }, 
                    {
                        text: 'Retry?',
                        onPress: () => connectToPrinter(),
                    }
                ]
            );
          }
        
    }
    const connectToPrinter = async () => {
        console.log("---POT04")
        try {
           
            const bluetoothEnabled =await BluetoothManager.isBluetoothEnabled()
            if (!bluetoothEnabled) {
                BluetoothManager.enableBluetooth()
                showPrintingError("ENABLE BLUE TOOTH AND RETRY." )
                             
              
            } else{
                await BluetoothManager.scanDevices()   
            }
            let scannedDevices = await BluetoothManager.scanDevices();
            
            if (!scannedDevices) {
                showPrintingError("NO CONNECTED PRINTERS FOUND." )
    
            } else {
                const scanned = JSON.parse(String(scannedDevices))
                //TO MAKE THIS CONFIGURABLE
                const  barCodePrinter =Array.from(scanned.paired).filter((b:any) => (b.name.toUpperCase().includes('BT-58L')))
                if (!barCodePrinter) {
                    showPrintingError("BT-58L LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
            
                }else {
                    return setPrinter(barCodePrinter[0])
                }

            }
            
        } catch (e: any) {
            showPrintingError(e.message )
        }
    }

    React.useEffect(() => {
        const fetchPrinterDetails = async () => {
            await connectToPrinter();
        
        };
        fetchPrinterDetails();
    }, []);

    const print = async () => {
        setPrinting(true)
        if(!printer){
           await connectToPrinter()
        }
        try {
            if(printer){
            await BluetoothManager.connect(printer.address)
            await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER)
            await BluetoothEscposPrinter.printQRCode(session['uid'],150,ERROR_CORRECTION.H,0)
            await BluetoothEscposPrinter.printAndFeed(2)
            await BluetoothEscposPrinter.printText(session['uid'],{})
            await BluetoothEscposPrinter.cutLine(1)
            }
        } catch (e: any) {
            showPrintingError(e.message)

        } finally{
            setPrinting(false)
        
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