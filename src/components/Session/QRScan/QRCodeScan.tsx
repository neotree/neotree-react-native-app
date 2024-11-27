import React, {useEffect} from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView,StatusBar} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission
} from "react-native-vision-camera";
import { fromHL7Like } from '../../../data/hl7Like'

import { Overlay } from "./Overlay";

export function QRCodeScan(props: any) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission()



  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if(codes && codes.length>0){
      const numberValue = codes[0].value
      if(numberValue){
        console.log('----UARAY---',fromHL7Like(numberValue))
        props.onRead(codes[0].value);
      }    
      }
    },
  });



  useEffect(() => {
    const requestCameraPermission = async () => {
    
        if(!hasPermission){
         await requestPermission()
        }
    };
    requestCameraPermission();
    setTimeout(() => {
      props.onRead(null);
    }, 30 * 1000);
  }, []);

    

  if (!hasPermission) {
    return (
      <View >
        <Text>Camera not available or not permitted</Text>
      </View>
    );
  }

  if (device ==null || !hasPermission) {
    return (
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <Text style={{ backgroundColor: "white" }}>
          Camera not available or not permitted
        </Text>
      </SafeAreaView>
    );
  }
  return (
   <SafeAreaView style={StyleSheet.absoluteFillObject}>
     {Platform.OS === "android" ? <StatusBar hidden /> : null}

     <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        
      />
   <Overlay/>
    </SafeAreaView>
  );
}

