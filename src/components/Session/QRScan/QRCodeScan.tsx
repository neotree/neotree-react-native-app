import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView, StatusBar, Alert, ActivityIndicator, Pressable, Dimensions, GestureResponderEvent } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
  useCameraFormat
} from "react-native-vision-camera";
import { fromHL7Like } from '../../../data/hl7Like'
import { logError } from '@/src/utils/logError';

const SIMPLE_QR_MAX_LENGTH = 12;
const SCAN_TIMEOUT_MS = 30 * 1000;

const normalizeValue = (value: unknown) => {
  if (value == null) return '';
  return String(value).trim();
};

const extractUidFromValue = (raw: string) => {
  if (!raw) return '';
  const value = normalizeValue(raw);
  if (value.length <= SIMPLE_QR_MAX_LENGTH) return value;

  const uidMatch = value.match(/(?:^|[?&]|\\b)uid[:=]([A-Za-z0-9_-]+)/i);
  if (uidMatch?.[1]) return uidMatch[1];

  if (value.includes('uid=')) {
    const query = value.includes('?') ? value.split('?')[1] : value;
    const params = new URLSearchParams(query);
    const uid = params.get('uid');
    if (uid) return uid;
  }

  const segments = value.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  if (lastSegment.length <= SIMPLE_QR_MAX_LENGTH) return lastSegment;

  return '';
};

export function QRCodeScan(props: any) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [didInitialFocus, setDidInitialFocus] = useState(false);
  const cameraRef = React.useRef<Camera>(null);
  const screen = Dimensions.get("window");
  const targetAspectRatio = useMemo(() => screen.height / screen.width, [screen.height, screen.width]);
  const format = useCameraFormat(device, [
    { videoResolution: "max" },
    { photoResolution: "max" },
    { videoAspectRatio: targetAspectRatio },
    { autoFocusSystem: "phase-detection" }
  ]);
  const exposureBoost = useMemo(() => {
    if (!device || typeof device.minExposure !== 'number' || typeof device.maxExposure !== 'number') {
      return undefined;
    }
    const target = 0.6;
    return Math.max(device.minExposure, Math.min(device.maxExposure, target));
  }, [device]);

  useEffect(() => {
    if (!device) return;
    const base = device.neutralZoom || 1;
    const boosted = Math.min(device.maxZoom || base, Math.max(base, 1.15));
    setZoom(boosted);
  }, [device]);

  useEffect(() => {
    if (!layout.width || !layout.height || didInitialFocus) return;
    if (!cameraRef.current) return;
    const timeout = setTimeout(() => {
      cameraRef.current?.focus({ x: 0.5, y: 0.5 }).catch(() => undefined);
      setDidInitialFocus(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, [layout.height, layout.width, didInitialFocus]);

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

  const onTapToFocus = useCallback(async (event: GestureResponderEvent) => {
    if (!cameraRef.current || !layout.width || !layout.height) return;
    const { locationX, locationY } = event.nativeEvent;
    const x = Math.min(1, Math.max(0, locationX / layout.width));
    const y = Math.min(1, Math.max(0, locationY / layout.height));
    try {
      await cameraRef.current.focus({ x, y });
    } catch {
      // ignore focus errors (not supported on all devices)
    }
  }, [layout.height, layout.width]);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {
      if (hasScanned || isProcessing) return;
      if (!codes || codes.length === 0) return;

      const firstValid = codes.find(code => normalizeValue(code?.value));
      const value = normalizeValue(firstValid?.value);
      if (!value) return;

      setHasScanned(true);

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
          if (props.generic) {
            const extracted = extractUidFromValue(value);
            if (extracted) {
              props.onRead(extracted);
              return;
            }
          }
          showInvalidQRError();
          return;
        }

        if (props.generic) {
          const extracted = extractUidFromValue(converted['uid'] || value);
          if (extracted) {
            props.onRead(extracted);
          } else {
            showInvalidQRError();
          }
        } else {
          props.onRead(converted);
        }
      } catch (error) {
        logError('QRCodeScan', error);
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
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={onTapToFocus}
        onLayout={(e) => setLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        <Camera
          ref={cameraRef}
          codeScanner={codeScanner}
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={true}
          format={format}
          fps={[10, 30]}
          enableZoomGesture={true}
          lowLightBoost={device?.supportsLowLightBoost ?? false}
          resizeMode="cover"
          androidPreviewViewType="texture-view"
          torch={device?.hasTorch && torchOn ? "on" : "off"}
          exposure={torchOn ? exposureBoost : undefined}
          zoom={zoom}
          photoQualityBalance="quality"
          videoStabilizationMode="auto"
        />
      </Pressable>
      {device?.hasTorch ? (
        <View style={styles.controls}>
          <Pressable
            onPress={() => setTorchOn(prev => !prev)}
            style={[styles.controlButton, torchOn ? styles.controlButtonActive : null]}
          >
            <Text style={styles.controlText}>{torchOn ? "Light On" : "Light Off"}</Text>
          </Pressable>
        </View>
      ) : null}
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
  controls: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlText: {
    color: '#fff',
    fontSize: 14,
  },
});
