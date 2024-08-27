import React from "react";
import {TouchableOpacity, Platform} from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';
import { Button } from "../../components/Button";
import { Br } from "../../components/Br";
import { Box } from "../../components/Theme";
import { NeotreeIDInput } from "../../components/Form";
import { PrintBarCode } from "../../components/Session/PrintBarCode";
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';
import * as types from '../../types';


export function PrintGenericBarCode({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'QrCode'>) {

    const [uid, setUID] = React.useState('');
    const [showQR, setShowQR] = React.useState(false);
    const [session,setSession] =   React.useState<any>(null);

    const openQRscanner = () => {
        setShowQR(true);
    };
    React.useEffect(()=>{
     setSession({'uid':uid})
    },[uid])

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
        if (qrtext) {
            setUID(qrtext);
        }
        setShowQR(false);
    };


    return (
        <>
            <NeotreeIDInput
                label="NEOTREE ID"
                onChange={uid => setUID(uid)}
                value={uid}
            />
            <Br spacing='l' />
            <Button 
                color="primary"
                onPress={() => openQRscanner()}>
                Scan QR
            </Button>
            {showQR ? <QRCodeScan onRead={onQrRead} /> : null}
            <Br spacing='l' />
            <PrintBarCode
                session={session}
                isGeneric={true}
            />
        </>
    );

}