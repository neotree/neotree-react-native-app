import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

import { getDeviceID } from '@/src/utils/getDeviceID';
import { postUpdateEvent } from '@/src/data/api';
import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';

export type OtaEventType =
  | 'ota_check_failed'
  | 'ota_update_available'
  | 'ota_update_not_available'
  | 'ota_update_applied';

type OtaEvent = {
  eventType: OtaEventType;
  appVersion?: string | null;
  runtimeVersion?: string | null;
  otaUpdateId?: string | null;
  otaChannel?: string | null;
  payload?: any;
  createdAt?: string;
  attempts?: number;
};

const getRuntimeVersion = () =>
  (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || null;

const isOnline = (netInfo: NetInfo.NetInfoState) =>
  Boolean(netInfo?.isConnected) && netInfo?.isInternetReachable !== false;

const buildBasePayload = async () => {
  const deviceId = await getDeviceID();

  const appVersion = Constants.expoConfig?.version || null;
  const runtimeVersion = getRuntimeVersion();
  const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : null;
  const otaChannel = (Updates as any).channel || null;

  return { deviceId, appVersion, runtimeVersion, otaUpdateId, otaChannel };
};

const enqueueEvent = async (event: OtaEvent) => {
  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_QUEUE);
  const list = raw ? JSON.parse(raw) : [];
  list.push({ ...event, createdAt: event.createdAt || new Date().toISOString() });
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_QUEUE, JSON.stringify(list));
};

export const flushOtaEvents = async () => {
  const lastFlushRaw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_LAST_FLUSH);
  if (lastFlushRaw) {
    const lastFlush = new Date(lastFlushRaw).getTime();
    if (!Number.isNaN(lastFlush) && Date.now() - lastFlush < 30000) return;
  }

  const netInfo = await NetInfo.fetch();
  if (!netInfo?.isConnected || !netInfo?.isInternetReachable) return;

  const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_QUEUE);
  const list: OtaEvent[] = raw ? JSON.parse(raw) : [];
  if (!list.length) return;

  const base = await buildBasePayload();
  if (!base.deviceId) return;

  const remaining: OtaEvent[] = [];

  for (const evt of list) {
    const res = await postUpdateEvent({
      deviceId: base.deviceId,
      eventType: evt.eventType,
      appVersion: evt.appVersion ?? base.appVersion,
      runtimeVersion: evt.runtimeVersion ?? base.runtimeVersion,
      otaUpdateId: evt.otaUpdateId ?? base.otaUpdateId,
      otaChannel: evt.otaChannel ?? base.otaChannel,
      payload: evt.payload ?? null,
    });

    if (res?.errors?.length) {
      const attempts = (evt.attempts || 0) + 1;
      if (attempts < 5) remaining.push({ ...evt, attempts });
    }
  }

  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_QUEUE, JSON.stringify(remaining));
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_EVENTS_LAST_FLUSH, new Date().toISOString());
};

export const recordOtaEvent = async (eventType: OtaEventType, payload?: any) => {
  const base = await buildBasePayload();
  if (!base.deviceId) return;

  await enqueueEvent({
    eventType,
    appVersion: base.appVersion,
    runtimeVersion: base.runtimeVersion,
    otaUpdateId: base.otaUpdateId,
    otaChannel: base.otaChannel,
    payload,
  });

  await flushOtaEvents();
};

export const checkForOtaUpdateAndRecord = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!isOnline(netInfo)) return;

    const res = await Updates.checkForUpdateAsync();
    if (res.isAvailable) {
      await recordOtaEvent('ota_update_available');
    } else {
      await recordOtaEvent('ota_update_not_available');
    }
  } catch (e: any) {
    await recordOtaEvent('ota_check_failed', { message: e?.message || 'Unknown error' });
  }
};

export type OtaCheckResult =
  | { status: 'offline' }
  | { status: 'no_update' }
  | { status: 'update_downloaded' }
  | { status: 'error'; message: string };

export const checkForOtaUpdateFetchAndRecord = async (): Promise<OtaCheckResult> => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!isOnline(netInfo)) return { status: 'offline' };

    const res = await Updates.checkForUpdateAsync();
    if (!res.isAvailable) {
      await recordOtaEvent('ota_update_not_available');
      return { status: 'no_update' };
    }

    await recordOtaEvent('ota_update_available');
    try {
      const fetched = await Updates.fetchUpdateAsync();
      if (fetched?.isNew) {
        return { status: 'update_downloaded' };
      }
      return { status: 'no_update' };
    } catch (e: any) {
      await recordOtaEvent('ota_check_failed', { message: e?.message || 'Fetch failed' });
      return { status: 'error', message: e?.message || 'Fetch failed' };
    }
  } catch (e: any) {
    await recordOtaEvent('ota_check_failed', { message: e?.message || 'Unknown error' });
    return { status: 'error', message: e?.message || 'Unknown error' };
  }
};

export const recordOtaAppliedIfChanged = async (previous: {
  appVersion?: string | null;
  runtimeVersion?: string | null;
  otaUpdateId?: string | null;
  otaChannel?: string | null;
} | null, current: {
  appVersion?: string | null;
  runtimeVersion?: string | null;
  otaUpdateId?: string | null;
  otaChannel?: string | null;
}) => {
  if (!previous) {
    await recordOtaEvent('ota_update_applied');
    return;
  }

  if (
    previous.appVersion !== current.appVersion ||
    previous.runtimeVersion !== current.runtimeVersion ||
    previous.otaUpdateId !== current.otaUpdateId ||
    previous.otaChannel !== current.otaChannel
  ) {
    await recordOtaEvent('ota_update_applied');
  }
};
