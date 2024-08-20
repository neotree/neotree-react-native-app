import React from "react";
import { useTheme} from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import {ActivityIndicator, Alert} from "react-native"
import {Button} from "../../components/Button"
import {reportErrors} from "../../data/api"
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    ERROR_CORRECTION,
    ALIGN
} from "tp-react-native-bluetooth-printer";
import * as Device from 'expo-device'

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
            reportErrors("QR_CODE_PRINTING",e)
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
            await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER)
            if(Device.osName==="Android" &&Device.osVersion!==null&& Number(Device.osVersion.substring(0, 1))<9){
                await BluetoothEscposPrinter.printQRCode(session?session['uid']:"NO-UID",200,ERROR_CORRECTION.M,0) 
                await BluetoothEscposPrinter.printText("\n",{})
                await BluetoothEscposPrinter.printText("\n",{})
                await BluetoothEscposPrinter.printText("\n",{})
            }else{ 
            await BluetoothEscposPrinter.printQRCode(session?session['uid']:"NO-UID",150,ERROR_CORRECTION.M,0)
            await BluetoothEscposPrinter.printText(session?session['uid']:"NO-UID",{})
            await BluetoothEscposPrinter.printText("\n",{})
               
            }   
           
            await BluetoothEscposPrinter.printerInit()
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