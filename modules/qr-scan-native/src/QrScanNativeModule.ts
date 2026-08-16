import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export const ZXING_FRAME_PROCESSOR_PLUGIN_NAME = 'scanQRCodesZXing';

type QrScanNativeModuleType = {
  isGmsAvailable(): boolean;
  decodeQrFromFile(path: string): Promise<string | null>;
};

let nativeModule: QrScanNativeModuleType | null = null;
if (Platform.OS === 'android') {
  try {
    nativeModule = requireNativeModule('QrScanNative');
  } catch {
    nativeModule = null;
  }
}

// Android-only native module (see expo-module.config.json). On iOS, or if the
// module failed to load, treat Google Play Services as available so callers
// fall back to VisionCamera's built-in codeScanner instead of ZXing.
export function isGmsAvailable(): boolean {
  if (!nativeModule) return true;
  try {
    return nativeModule.isGmsAvailable();
  } catch {
    return true;
  }
}

// Decodes a QR code from a full-resolution still photo (see the takePhoto
// fallback in QRCodeScan.tsx). Android-only (see expo-module.config.json);
// returns null on iOS, on decode failure, or if the module failed to load.
export async function decodeQrFromFile(path: string): Promise<string | null> {
  if (!nativeModule) return null;
  try {
    return await nativeModule.decodeQrFromFile(path);
  } catch {
    return null;
  }
}
