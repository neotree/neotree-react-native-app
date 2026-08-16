import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView, StatusBar, Alert, ActivityIndicator, Pressable, Dimensions, GestureResponderEvent } from "react-native";
import { runOnJS } from "react-native-reanimated";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
  useCameraFormat,
  useFrameProcessor,
  VisionCameraProxy
} from "react-native-vision-camera";
import { fromHL7Like } from '../../../data/hl7Like'
import { logError } from '@/src/utils/logError';
import { reportErrors } from '../../../data/api'
import { isGmsAvailable, decodeQrFromFile, ZXING_FRAME_PROCESSOR_PLUGIN_NAME } from '../../../../modules/qr-scan-native/src/QrScanNativeModule'

const SIMPLE_QR_MAX_LENGTH = 12;
const SCAN_TIMEOUT_MS = 30 * 1000;
const REFOCUS_INTERVAL_MS = 2500;
// MLKit's live codeScanner analyzes a resolution-capped stream (~720p-1080p
// regardless of the device's actual sensor resolution), so a dense/high-version
// QR code can be located (corners/frame reported) but never decoded. If that
// keeps happening for this long, fall back to a full-resolution still photo,
// which has far more pixels per module to work with.
const UNKNOWN_BLOB_FALLBACK_MS = 1200;
// Minimum gap between photo-fallback attempts, so a still-undecodable code
// doesn't trigger a photo capture on every frame.
const FALLBACK_COOLDOWN_MS = 2500;

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
  // Devices without Google Play Services (e.g. stock Fire OS tablets) can't use
  // VisionCamera's built-in MLKit-based codeScanner at all, since MLKit's model
  // is fetched through Play Services. On those devices, fall back to a fully
  // local ZXing decoder instead. This is fixed for the lifetime of the device,
  // so it's safe to compute once.
  const useZXing = useMemo(() => Platform.OS === "android" && !isGmsAvailable(), []);
  const [hasScanned, setHasScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [didInitialFocus, setDidInitialFocus] = useState(false);
  // VisionCamera only guarantees takePhoto() is safe to call once onInitialized
  // has fired - calling it before that (e.g. moments after the screen mounts,
  // while the photo output is still being bound) throws a raw "Camera is
  // closed" error rather than a typed one.
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const cameraRef = React.useRef<Camera>(null);
  // Photo-fallback bookkeeping (see UNKNOWN_BLOB_FALLBACK_MS above). Refs, not
  // state, since they're only read/written from the codeScanner callback and
  // don't need to trigger a re-render.
  const unknownBlobSinceRef = React.useRef<number | null>(null);
  const isFallbackCapturingRef = React.useRef(false);
  const lastFallbackAttemptRef = React.useRef(0);
  const screen = Dimensions.get("window");
  const targetAspectRatio = useMemo(() => screen.height / screen.width, [screen.height, screen.width]);
  const format = useCameraFormat(device, [
    { videoResolution: "max" },
    { photoResolution: "max" },
    { videoAspectRatio: targetAspectRatio },
    { autoFocusSystem: "phase-detection" }
  ]);
  const clampExposure = useCallback((target: number) => {
    if (!device || typeof device.minExposure !== 'number' || typeof device.maxExposure !== 'number') {
      return undefined;
    }
    return Math.max(device.minExposure, Math.min(device.maxExposure, target));
  }, [device]);
  // Many low-cost Android devices meter for the whole scene and leave printed
  // QR codes underexposed in typical clinic lighting. A mild boost is applied
  // by default (not just when the torch is on) to keep code contrast readable.
  const defaultExposureBoost = useMemo(() => clampExposure(0.3), [clampExposure]);
  const torchExposureBoost = useMemo(() => clampExposure(0.6), [clampExposure]);

  useEffect(() => {
    if (!device) return;
    // Stay at the device's natural (neutral) zoom rather than forcing a
    // digital zoom-in: on many 2022-era Android devices a non-neutral zoom
    // crops the sensor output and can trigger AF/AE hunting, which costs more
    // scans than the slight magnification gains back. Users can still pinch
    // to zoom in for small or distant codes via enableZoomGesture.
    setZoom(device.neutralZoom || 1);
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

  // Continuous autofocus on older/cheaper camera modules can drift or hunt,
  // especially at typical QR-scanning distances. Periodically nudging focus
  // back to the center of frame recovers scans that would otherwise sit just
  // out of focus until the user manually taps.
  useEffect(() => {
    if (!didInitialFocus || hasScanned || isProcessing) return;
    const interval = setInterval(() => {
      cameraRef.current?.focus({ x: 0.5, y: 0.5 }).catch(() => undefined);
    }, REFOCUS_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [didInitialFocus, hasScanned, isProcessing]);

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

  const onCameraError = useCallback((error: any) => {
    reportErrors('QR_SCAN_CAMERA_ERROR', error?.code || error?.message || error);
    // ML Kit's barcode model is fetched by Play Services on first use; on a
    // device that hasn't downloaded it yet (fresh install, poor connectivity)
    // scanning silently finds nothing until it's ready. Surface that clearly
    // instead of letting it look like a broken or unreadable QR code.
    if (error?.code === 'code-scanner/cannot-load-model') {
      Alert.alert(
        'Preparing QR Scanner',
        'The QR scanner is finishing a one-time setup step and needs an internet connection. Please connect to the internet and try again shortly.',
        [{ text: 'Retry', onPress: () => setHasScanned(false), style: 'cancel' }]
      );
    }
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

  const handleDecodedValue = useCallback(async (value: string) => {
    if (hasScanned || isProcessing) return;
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
      console.error("[QR SCAN ERROR]", error);
      showInvalidQRError();
    } finally {
      setIsProcessing(false);
    }
  }, [hasScanned, isProcessing, props, showInvalidQRError]);

  const attemptPhotoFallback = useCallback(async () => {
    if (!cameraRef.current || !isCameraInitialized || hasScanned || isProcessing || isFallbackCapturingRef.current) return;
    isFallbackCapturingRef.current = true;
    lastFallbackAttemptRef.current = Date.now();
    try {
      await cameraRef.current.focus({ x: 0.5, y: 0.5 }).catch(() => undefined);

      // "Camera is closed" (a raw, untyped error) can surface transiently -
      // e.g. right as the capture session finishes (re)binding the photo
      // output - so one retry is given before giving up on this attempt.
      let photo;
      try {
        photo = await cameraRef.current.takePhoto({ enableShutterSound: false });
      } catch (error) {
        console.log('[QR DEBUG] photo fallback capture error, retrying once', error);
        await new Promise(resolve => setTimeout(resolve, 300));
        photo = await cameraRef.current.takePhoto({ enableShutterSound: false });
      }

      console.log(`[QR DEBUG] photo fallback captured ${photo.width}x${photo.height}, decoding...`);
      const value = normalizeValue(await decodeQrFromFile(photo.path));
      if (value) {
        console.log(`[QR DEBUG] photo fallback decoded value length=${value.length}`);
        await handleDecodedValue(value);
      } else {
        console.log('[QR DEBUG] photo fallback failed to decode');
      }
    } catch (error) {
      logError('QRCodeScan', error);
    } finally {
      isFallbackCapturingRef.current = false;
      unknownBlobSinceRef.current = null;
    }
  }, [isCameraInitialized, hasScanned, isProcessing, handleDecodedValue]);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {
      if (useZXing) return;
      // TEMPORARY: diagnostic logging to tell apart "MLKit never detects the
      // code" from "MLKit detects it but the decoded value is empty/wrong",
      // for QR codes that scan fine with the phone's native camera/scanner
      // but fail in this app. Remove once confirmed.
      console.log(
        `[QR DEBUG] onCodeScanned: ${codes?.length ?? 0} code(s)`,
        (codes || []).map(c => ({
          type: c?.type,
          valueLength: normalizeValue(c?.value).length,
          corners: c?.corners,
          frame: c?.frame,
        }))
      );
      if (!codes || codes.length === 0) {
        unknownBlobSinceRef.current = null;
        return;
      }

      const firstValid = codes.find(code => normalizeValue(code?.value));
      const value = normalizeValue(firstValid?.value);
      if (!value) {
        console.log('[QR DEBUG] code(s) detected but all values were empty after normalization');
        const now = Date.now();
        if (unknownBlobSinceRef.current == null) {
          unknownBlobSinceRef.current = now;
        } else if (
          now - unknownBlobSinceRef.current >= UNKNOWN_BLOB_FALLBACK_MS &&
          now - lastFallbackAttemptRef.current >= FALLBACK_COOLDOWN_MS
        ) {
          await attemptPhotoFallback();
        }
        return;
      }

      unknownBlobSinceRef.current = null;
      console.log(`[QR DEBUG] decoded value length=${value.length}, first 20 chars="${value.slice(0, 20)}"`);
      await handleDecodedValue(value);
    },
  });

  const zxingPlugin = useMemo(
    () => (useZXing ? VisionCameraProxy.initFrameProcessorPlugin(ZXING_FRAME_PROCESSOR_PLUGIN_NAME, {}) : undefined),
    [useZXing]
  );

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!useZXing || !zxingPlugin) return;
    const result = zxingPlugin.call(frame) as { value?: string } | undefined;
    const value = normalizeValue(result?.value);
    // TEMPORARY: diagnostic logging - see the console.log calls in
    // onCodeScanned above for why. Remove once confirmed.
    if (result !== undefined) {
      console.log(`[QR DEBUG] zxing frame processor result: valueLength=${value.length}`);
    }
    if (!value) return;
    runOnJS(handleDecodedValue)(value);
  }, [useZXing, zxingPlugin, handleDecodedValue]);

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
          codeScanner={useZXing ? undefined : codeScanner}
          frameProcessor={useZXing ? frameProcessor : undefined}
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={true}
          photo={!useZXing}
          format={format}
          fps={[10, 30]}
          enableZoomGesture={true}
          lowLightBoost={device?.supportsLowLightBoost ?? false}
          resizeMode="cover"
          androidPreviewViewType="texture-view"
          torch={device?.hasTorch && torchOn ? "on" : "off"}
          exposure={torchOn ? torchExposureBoost : defaultExposureBoost}
          zoom={zoom}
          photoQualityBalance="quality"
          videoStabilizationMode="auto"
          onError={onCameraError}
          onInitialized={() => setIsCameraInitialized(true)}
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
