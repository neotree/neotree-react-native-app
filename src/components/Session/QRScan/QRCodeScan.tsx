import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Platform, SafeAreaView, StatusBar, Alert, ActivityIndicator, Pressable, useWindowDimensions, GestureResponderEvent } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
  useCameraFormat
} from "react-native-vision-camera";
import { scanFromURLAsync } from "expo-camera";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { fromHL7Like } from '../../../data/hl7Like'
import { logError } from '@/src/utils/logError';

// react-native-vision-camera is a native module - it isn't present in Expo
// Go, so useCameraDevice() will always return undefined there regardless of
// how many times the screen is retried. Detect that case up front so the
// user gets an actionable message instead of a dead-end retry loop.
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const SIMPLE_QR_MAX_LENGTH = 12;
const SCAN_TIMEOUT_MS = 30 * 1000;
// MLKit's live codeScanner analyzes a resolution-capped stream (~720p-1080p
// regardless of the device's actual sensor resolution), so a dense/high-version
// QR code can be located (corners/frame reported) but never decoded. If that
// keeps happening for this long, fall back to a full-resolution still photo,
// decoded via expo-camera's scanFromURLAsync (MLKit's still-image API, which
// runs against the photo's actual resolution rather than the capped stream).
const UNKNOWN_BLOB_FALLBACK_MS = 1200;
// A frame with zero codes at all (MLKit couldn't even locate a finder
// pattern - not just fail to decode one) gets a longer dwell before falling
// back to a still photo, since it's ambiguous whether a code is present and
// too dense/angled to locate, or the camera simply isn't pointed at one yet.
const NO_CODE_FALLBACK_MS = 4000;
// Minimum gap between photo-fallback attempts, so a still-undecodable code
// doesn't trigger a photo capture on every frame.
const FALLBACK_COOLDOWN_MS = 2500;
// useCameraDevice's device list is a module-level singleton populated once
// at native-module load time and only updated via a native "devices changed"
// event - if that event fires while this screen isn't mounted (e.g. camera
// enumeration finishing shortly after a cold app start), the running
// instance never sees it and is stuck reporting no device, even though a
// fresh mount would immediately see the up-to-date list. Remounting the
// device-dependent subtree a few times gives that event a chance to have
// landed, instead of leaving the user stuck on a dead-end error until they
// manually back out and reopen the screen.
const DEVICE_RETRY_LIMIT = 6;
const DEVICE_RETRY_DELAY_MS = 700;

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
  const [remountKey, setRemountKey] = useState(0);
  const [deviceAttempt, setDeviceAttempt] = useState(0);
  return (
    <QRCodeScanInner
      key={remountKey}
      {...props}
      deviceAttempt={deviceAttempt}
      // Called by the auto-retry loop while still within DEVICE_RETRY_LIMIT.
      onAutoRetryDevice={() => {
        setRemountKey(count => count + 1);
        setDeviceAttempt(count => count + 1);
      }}
      // Called by the user-facing Retry button once the auto-retry loop has
      // given up. Resets the attempt count back to 0 (rather than leaving it
      // past DEVICE_RETRY_LIMIT forever) so the user sees the same
      // "Preparing camera..." feedback and a fresh round of real attempts,
      // instead of the error screen instantly reappearing unchanged - which
      // reads as the button doing nothing.
      onRetryDevice={() => {
        setRemountKey(count => count + 1);
        setDeviceAttempt(0);
      }}
    />
  );
}

function QRCodeScanInner(props: any) {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
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
  const screen = useWindowDimensions();
  const targetAspectRatio = useMemo(() => screen.height / screen.width, [screen.height, screen.width]);
  // videoAspectRatio must be the top-priority filter (useCameraFormat ranks
  // filters by array order, highest priority first) - otherwise a
  // videoResolution/photoResolution "max" filter can win out and select a
  // format whose aspect ratio is the sensor's native shape (often close to
  // 4:3) rather than the phone's screen shape (often close to 19.5:9). With
  // resizeMode="cover" that mismatch gets center-cropped to fill the screen,
  // cutting visibly into the sides - and by an amount that varies per device
  // depending on how far off its sensor's max-resolution aspect ratio is.
  // The live codeScanner stream is resolution-capped by MLKit regardless
  // (see UNKNOWN_BLOB_FALLBACK_MS above), so there's no need to also demand
  // max video resolution here; photoResolution stays "max" since that's what
  // the full-resolution still-photo fallback relies on.
  const format = useCameraFormat(device, [
    { videoAspectRatio: targetAspectRatio },
    { photoResolution: "max" },
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
    if (IS_EXPO_GO || device || props.deviceAttempt >= DEVICE_RETRY_LIMIT) return;
    const timeout = setTimeout(() => props.onAutoRetryDevice(), DEVICE_RETRY_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [device, props.deviceAttempt, props.onAutoRetryDevice]);

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
        await new Promise(resolve => setTimeout(resolve, 300));
        photo = await cameraRef.current.takePhoto({ enableShutterSound: false });
      }

      const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      const results = await scanFromURLAsync(uri, ['qr']);
      const value = normalizeValue(results?.[0]?.data);
      if (value) {
        await handleDecodedValue(value);
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
      if (hasScanned || isProcessing) return;

      const firstValid = codes?.find(code => normalizeValue(code?.value));
      const value = normalizeValue(firstValid?.value);
      if (value) {
        unknownBlobSinceRef.current = null;
        await handleDecodedValue(value);
        return;
      }

      // Either a code was located (corners/frame reported) but MLKit's live
      // stream couldn't decode it - most likely too dense for the capped
      // stream resolution - or no code was located at all, which for a very
      // dense/angled code can mean MLKit couldn't even find its finder
      // pattern in the capped stream. Either way, give it a moment in case
      // it's just a transient miss, then fall back to a full-resolution
      // still, which runs against the photo's actual resolution rather than
      // the capped live stream. A located-but-undecoded code gets the
      // shorter threshold, since we already know something's there.
      const located = !!codes && codes.length > 0;
      const now = Date.now();
      if (unknownBlobSinceRef.current == null) {
        unknownBlobSinceRef.current = now;
      } else if (
        now - unknownBlobSinceRef.current >= (located ? UNKNOWN_BLOB_FALLBACK_MS : NO_CODE_FALLBACK_MS) &&
        now - lastFallbackAttemptRef.current >= FALLBACK_COOLDOWN_MS
      ) {
        await attemptPhotoFallback();
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
    const stillRetrying = !IS_EXPO_GO && props.deviceAttempt < DEVICE_RETRY_LIMIT;
    return (
      <SafeAreaView style={styles.centerContainer}>
        {stillRetrying ? (
          <>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12 }}>Preparing camera...</Text>
          </>
        ) : (
          <>
            <Text style={{ textAlign: 'center' }}>
              {IS_EXPO_GO
                ? 'QR scanning is not available in Expo Go. Please use the Neotree development build instead.'
                : 'Camera device not available'}
            </Text>
            {!IS_EXPO_GO && (
              <Pressable onPress={props.onRetryDevice} style={[styles.controlButton, { marginTop: 16 }]}>
                <Text style={styles.controlText}>Retry</Text>
              </Pressable>
            )}
          </>
        )}
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
          photo={true}
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
