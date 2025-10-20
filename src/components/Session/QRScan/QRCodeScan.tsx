import React, {useEffect} from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView, StatusBar, Alert} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission
} from "react-native-vision-camera";
import { fromHL7Like } from '../../../data/hl7Like'

export function QRCodeScan(props: any) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission()

  const showInvalidQRError = () => {
    Alert.alert(
      'Invalid QR Code',
      'The scanned QR code cannot be processed. Please use manual search.',
       [
            {
                text: 'Retry',
                style: 'cancel'
            },
        ]
    );
  }

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {   
      if(codes && codes.length > 0){
        const value = codes[0].value
        if(value){
          if(value.length <= 12){
            props.onRead(value);
          } else {
            try {
              const converted = await fromHL7Like(value)
              
              // Check if conversion was successful and has data
              if(converted && typeof converted === 'object' && Object.keys(converted).length > 0){
                if(props.generic){
                  if(converted['uid']){
                    props.onRead(converted['uid']);
                  } else {
                    showInvalidQRError();
                  }
                } else {
                  props.onRead(converted);
                }
              } else {
                // Conversion failed or returned empty/invalid data
                showInvalidQRError();
              }
            } catch (error) {
              console.error("[QR SCAN ERROR]", error);
              showInvalidQRError();
            }
          }
        } else {
          showInvalidQRError();
        }
      } else {
        showInvalidQRError();
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
      <View>
        <Text>Camera not available or not permitted</Text>
      </View>
    );
  }

  if (device == null || !hasPermission) {
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
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}  
      />
    </SafeAreaView>
  );
}