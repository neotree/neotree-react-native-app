import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View,Platform,PermissionsAndroid,Animated} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import Icon from '@expo/vector-icons/MaterialIcons';

export function QRCodeScan (props:any){
  const [hasPermission, setHasPermission] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [refresh, setRefresh] = useState(false);
  const device = useCameraDevice("back");
  const codeScanner = useCodeScanner({
    codeTypes: ["qr","pdf-417","aztec","data-matrix"],
    onCodeScanned: (codes) => {
      console.log("....UIUI-...",codes)
      props.onRead(codes[0].value);
    },
  });
  const styles = StyleSheet.create({
    page2: {
      flex: 1,
      position: "absolute",
      top: 0,
      height: props&&props.size?props.size:"200%",
      width: "100%",
      borderColor:"green",
      alignItems: "center",
      justifyContent: "center",
    },
    backHeader: {
      backgroundColor: "#00000090",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      padding: "2%",
      height: "5%",
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    footer: {
      backgroundColor: "#00000090",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "10%",
      height: "20%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    laser: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: 'red',
      opacity: 0.8,
  },
  });


  useEffect(() => {
    // exception case
    setRefresh(!refresh);
  }, [device, hasPermission]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      if(Platform.OS==='android'){
      const cameraPermissions = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
    
      if(!cameraPermissions){
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      setHasPermission(permission === "granted");
      }else{
        setHasPermission(cameraPermissions)
      }
      }
    };

    requestCameraPermission();
    
    Animated.loop(
      Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
      })
  ).start();
   //if it is idle for 15 secs, it will be closed
   setTimeout(() => {
    props.onRead(null);
  }, 20 * 1000);
  }, []);

  const laserTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust according to your needs
});

  if (device == null || !hasPermission) {
    return (
      <View style={styles.page2}>
        <Text style={{ backgroundColor: "white" }}>
          Camera not available or not permitted
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page2}>
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <View style={styles.backHeader}>
        <TouchableOpacity
          style={{ padding: 10 }}
          onPress={() => {
            props.onRead(null);
          }}
        >
          <Icon 
						name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
						size={28} 
						color={"red"}
					/>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "grey",
            backgroundColor:"red",
            alignItems: "center",
          }}
          onPress={() => {
            props.onRead(null);
          }}
        >
          <Text style={{ color: "white",fontWeight:'500' }}>Close</Text>
        </TouchableOpacity>
      </View>
       <Animated.View style={[styles.laser, { transform: [{ translateY: laserTranslateY }] }]} />
    </View>
  );
  
};


