import React from "react";
import {TouchableOpacity, Platform} from "react-native";
import { View, Text, Button as Btn, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Button } from "../../components/Button";
import { Br } from "../../components/Br";
import { Box } from "../../components/Theme";
import { NeotreeIDInput } from "../../components/Form";
import { PrintBarCode } from "../../components/Session/PrintBarCode";
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';
import * as types from '../../types';
import { useIsFocused } from '@react-navigation/native';


export function PrintGenericBarCode({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'QrCode'>) {

    const [uid, setUID] = React.useState('');
    const [showQR, setShowQR] = React.useState(false);
    const [session,setSession] =   React.useState<any>(null);
    const focused = useIsFocused()

    const openQRscanner = () => {
        setShowQR(true);
    };
    React.useEffect(()=>{
     if(focused){
        setUID('')
        setSession(null)
     }
     
    },[focused])

    React.useEffect(() => {
		navigation.setOptions({
			headerLeft: ({ tintColor }) => (
				<Box marginLeft="m">
					<TouchableOpacity onPress={() => navigation.navigate('Home')}>
						<Icon 
							name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
							size={28} 
							color={tintColor}
						/>
					</TouchableOpacity>
				</Box>
			),
		});
	}, [navigation]);

    const onQrRead = (qrtext: any) => {
       //TODO VALIDATE INCOMING SESSION TO TAKE ONLY THE UID FOR PRINTING
        if (qrtext) {
            setUID(qrtext);
            setSession({"uid":qrtext})
        }
        setShowQR(false);
    };

    // return (
    //     <>
    //         <NeotreeIDInput
    //             label="NEOTREE ID"
    //             onChange={uid => setUID(uid)}
    //             value={uid}
    //         />
    //         <Br spacing='l' />
    //         <Button 
    //             color="primary"
    //             onPress={() => openQRscanner()}>
    //             Scan QR
    //         </Button>
    //         {showQR ? <QRCodeScan onRead={onQrRead} generic={true}/> : null}
    //         <Br spacing='l' />
    //         {uid &&  <PrintBarCode
    //             session={session}
    //             isGeneric={true}

    //         />}
            
    //     </>
    // );
        return (
            <View style={styles.container}>
              <Text style={styles.message}>🚧 This feature is going to be used to print QR CODES.It is coming soon! 🚧</Text>
              <Btn color={'maroon'} title="GET ME OUT OF HERE!!" onPress={() => navigation.navigate('Home')} />
            </View>
          );


}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#ffeeba',
      borderRadius: 8,
      margin: 20,
    },
    message: {
      fontSize: 24, 
      marginBottom: 10,
    }
  });