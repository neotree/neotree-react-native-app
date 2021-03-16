import { Platform } from 'react-native';
import * as Device from 'expo-device';

export default () => ({
  isDevice: Device.isDevice,
  brand: Device.brand,
  manufacturer: Device.manufacturer,
  modelName: Device.modelName,
  deviceYearClass: Device.deviceYearClass,
  totalMemory: Device.totalMemory,
  supportedCpuArchitectures: Device.supportedCpuArchitectures,
  osName: Device.osName,
  osVersion: Device.osVersion,
  osBuildId: Device.osBuildId,
  osInternalBuildId: Device.osInternalBuildId,
  deviceName: Device.deviceName,

  ...Platform.OS === 'ios' ? {
    modelId: Device.modelId,
  } : null,

  ...Platform.OS === 'android' ? {
    designName: Device.designName,
    productName: Device.productName,
    osBuildFingerprint: Device.osBuildFingerprint,
    platformApiLevel: Device.platformApiLevel,
  } : null,
});
