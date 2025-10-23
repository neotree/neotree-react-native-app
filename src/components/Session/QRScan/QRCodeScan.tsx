import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView, StatusBar, Alert, ActivityIndicator } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission
} from "react-native-vision-camera";
import { fromHL7Like } from '../../../data/hl7Like'

const SIMPLE_QR_MAX_LENGTH = 12;
const SCAN_TIMEOUT_MS = 30 * 1000;

export function QRCodeScan(props: any) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const showInvalidQRError = useCallback(() => {
    Alert.alert(
      'Invalid QR Code',
      'The scanned QR code cannot be processed. Please use manual search.',
      [
        {
          text: 'Retry',
          onPress: () => setHasScanned(false),
          style: 'cancel'
        },
      ]
    );
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {
      if (hasScanned || isProcessing) return;
      
      setHasScanned(true);
      
      if (!codes || codes.length === 0) {
        showInvalidQRError();
        return;
      }

      const value = codes[0].value;
      
      if (!value) {
        showInvalidQRError();
        return;
      }

      // Simple QR code (direct ID)
      if (value.length <= SIMPLE_QR_MAX_LENGTH) {
        props.onRead(value);
        return;
      }

      // Complex QR code (HL7-like format)
      setIsProcessing(true);
      try {
        const converted = await fromHL7Like(value);
        if (!converted || typeof converted !== 'object' || Object.keys(converted).length === 0) {
          showInvalidQRError();
          return;
        }

        if (props.generic) {
          if (converted['uid']) {
            props.onRead(converted['uid']);
          } else {
            showInvalidQRError();
          }
        } else {
          props.onRead(converted);
        }
      } catch (error) {
        console.error("[QR SCAN ERROR]", error);
        showInvalidQRError();
      } finally {
        setIsProcessing(false);
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    const timeoutId = setTimeout(() => {
      props.onRead(null);
    }, SCAN_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [hasPermission, requestPermission, props]);

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Camera permission required. Please enable it in settings.</Text>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Camera device not available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "android" && <StatusBar hidden />}
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
      />
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing QR Code...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});