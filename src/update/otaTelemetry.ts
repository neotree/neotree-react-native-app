import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

import { getDeviceID } from '@/src/utils/getDeviceID';
import { postUpdateEvent } from '@/src/data/api';
import { getUpdatePolicyData } from '@/src/data/queries';
import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';

export type OtaEventType =
  | 'ota_check_failed'
  | 'ota_update_available'
  | 'ota_update_fetched'
  | 'ota_update_not_available'
  | 'ota_update_applied';

export type OtaLastStatus = {
  status: string;
  message?: string | null;
  otaUpdateId?: string | null;
  otaChannel?: string | null;
  runtimeVersion?: string | null;
  appVersion?: string | null;
  checkedAt?: string;
  sessionId?: string;
};

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

const isOnline = (netInfo: NetInfoState) =>
  Boolean(netInfo?.isConnected) && netInfo?.isInternetReachable !== false;

const otaSessionId = `ota-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const OTA_TELEMETRY_SAMPLE_RATE = 0.2;
const OTA_RETRY_BASE_MINUTES = 5;
const OTA_RETRY_MAX_MINUTES = 6 * 60;
const OTA_MAX_FAILURES_BEFORE_DISABLE = 5;
const OTA_DISABLE_HOURS = 24;

const buildBasePayload = async () => {
  const deviceId = await getDeviceID();

  const appVersion = Constants.expoConfig?.version || null;
  const runtimeVersion = getRuntimeVersion();
  const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : null;
  const otaChannel = (Updates as any).channel || null;
  return { deviceId, appVersion, runtimeVersion, otaUpdateId, otaChannel };
};

const shouldSampleEvent = (eventType: OtaEventType) => {
  if (eventType === 'ota_update_applied') return true;
  if (eventType === 'ota_update_fetched') return true;
  if (eventType === 'ota_check_failed') return true;
  return Math.random() < OTA_TELEMETRY_SAMPLE_RATE;
};

const persistLastOtaStatus = async (data: {
  status: string;
  message?: string | null;
  otaUpdateId?: string | null;
  otaChannel?: string | null;
  runtimeVersion?: string | null;
  appVersion?: string | null;
}) => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.OTA_LAST_STATUS,
      JSON.stringify({
        ...data,
        checkedAt: new Date().toISOString(),
        sessionId: otaSessionId,
      }),
    );
  } catch {
    // ignore storage errors
  }
};

export const getLastOtaStatus = async (): Promise<OtaLastStatus | null> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_LAST_STATUS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getRetryState = async () => {
  const [countRaw, retryAtRaw, disabledUntilRaw] = await Promise.all([
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_RETRY_COUNT),
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_RETRY_AT),
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_DISABLED_UNTIL),
  ]);
  const count = Number(countRaw || 0);
  const retryAt = retryAtRaw ? new Date(retryAtRaw).getTime() : null;
  const disabledUntil = disabledUntilRaw ? new Date(disabledUntilRaw).getTime() : null;
  return { count, retryAt, disabledUntil };
};

const resetRetryState = async () => {
  await Promise.all([
    AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.OTA_RETRY_COUNT),
    AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.OTA_RETRY_AT),
    AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.OTA_DISABLED_UNTIL),
  ]);
};

const scheduleRetry = async (count: number) => {
  const exp = Math.min(count, 6);
  const delayMinutes = Math.min(OTA_RETRY_BASE_MINUTES * Math.pow(2, exp - 1), OTA_RETRY_MAX_MINUTES);
  const retryAt = new Date(Date.now() + delayMinutes * 60000).toISOString();
  await Promise.all([
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_RETRY_COUNT, `${count}`),
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_RETRY_AT, retryAt),
  ]);
  return retryAt;
};

const disableOtaTemporarily = async (count: number) => {
  const disabledUntil = new Date(Date.now() + OTA_DISABLE_HOURS * 3600000).toISOString();
  await Promise.all([
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_DISABLED_UNTIL, disabledUntil),
    AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_RETRY_COUNT, `${count}`),
  ]);
  return disabledUntil;
};

const evaluatePolicyGate = async (runtimeVersion: string | null, otaChannel: string | null) => {
  try {
    const policy = await getUpdatePolicyData();
    if (policy?.ota && policy.ota.enabled === false) {
      return { allow: false, reason: 'OTA disabled by policy' };
    }
    if (policy?.ota?.channel && otaChannel && policy.ota.channel !== otaChannel) {
      return { allow: false, reason: 'OTA channel mismatch with policy' };
    }
    if (policy?.runtimeVersion && runtimeVersion && policy.runtimeVersion !== runtimeVersion) {
      return { allow: false, reason: 'Runtime mismatch with policy' };
    }
    return { allow: true };
  } catch {
    return { allow: true };
  }
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
  if (!shouldSampleEvent(eventType)) return;

  await enqueueEvent({
    eventType,
    appVersion: base.appVersion,
    runtimeVersion: base.runtimeVersion,
    otaUpdateId: base.otaUpdateId,
    otaChannel: base.otaChannel,
    payload: { ...payload, sessionId: otaSessionId },
  });

  await flushOtaEvents();
};

export const checkForOtaUpdateAndRecord = async () => {
  try {
    const retryState = await getRetryState();
    if (retryState.disabledUntil && Date.now() < retryState.disabledUntil) {
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'disabled',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!isOnline(netInfo)) {
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'offline',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      return;
    }

    const policyGate = await evaluatePolicyGate(getRuntimeVersion(), (Updates as any).channel || null);
    if (!policyGate.allow) {
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'disabled',
        message: policyGate.reason,
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      return;
    }

    const res = await Updates.checkForUpdateAsync();
    if (res.isAvailable) {
      await recordOtaEvent('ota_update_available');
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'available',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      await resetRetryState();
    } else {
      await recordOtaEvent('ota_update_not_available');
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'not_available',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      await resetRetryState();
    }
  } catch (e: any) {
    await recordOtaEvent('ota_check_failed', { message: e?.message || 'Unknown error' });
    const base = await buildBasePayload();
    await persistLastOtaStatus({
      status: 'error',
      message: e?.message || 'Unknown error',
      otaUpdateId: base.otaUpdateId,
      otaChannel: base.otaChannel,
      runtimeVersion: base.runtimeVersion,
      appVersion: base.appVersion,
    });

    const retryState = await getRetryState();
    const nextCount = (retryState.count || 0) + 1;
    if (nextCount >= OTA_MAX_FAILURES_BEFORE_DISABLE) {
      await disableOtaTemporarily(nextCount);
    } else {
      await scheduleRetry(nextCount);
    }
  }
};

export type OtaCheckResult =
  | { status: 'offline' }
  | { status: 'no_update' }
  | { status: 'update_downloaded' }
  | { status: 'deferred'; message?: string }
  | { status: 'disabled'; message?: string }
  | { status: 'error'; message: string };

export const checkForOtaUpdateFetchAndRecord = async (opts?: { force?: boolean }): Promise<OtaCheckResult> => {
  try {
    const retryState = await getRetryState();
    if (!opts?.force) {
      if (retryState.disabledUntil && Date.now() < retryState.disabledUntil) {
        const base = await buildBasePayload();
        await persistLastOtaStatus({
          status: 'disabled',
          otaUpdateId: base.otaUpdateId,
          otaChannel: base.otaChannel,
          runtimeVersion: base.runtimeVersion,
          appVersion: base.appVersion,
        });
        return { status: 'disabled', message: 'OTA checks disabled temporarily' };
      }

      if (retryState.retryAt && Date.now() < retryState.retryAt) {
        const base = await buildBasePayload();
        await persistLastOtaStatus({
          status: 'deferred',
          otaUpdateId: base.otaUpdateId,
          otaChannel: base.otaChannel,
          runtimeVersion: base.runtimeVersion,
          appVersion: base.appVersion,
        });
        return { status: 'deferred', message: 'Retry scheduled' };
      }
    }

    const netInfo = await NetInfo.fetch();
    if (!isOnline(netInfo)) {
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'offline',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      return { status: 'offline' };
    }

    const policyGate = await evaluatePolicyGate(getRuntimeVersion(), (Updates as any).channel || null);
    if (!policyGate.allow) {
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'disabled',
        message: policyGate.reason,
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      return { status: 'disabled', message: policyGate.reason };
    }

    const res = await Updates.checkForUpdateAsync();
    if (!res.isAvailable) {
      await recordOtaEvent('ota_update_not_available');
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'not_available',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      await resetRetryState();
      return { status: 'no_update' };
    }

    await recordOtaEvent('ota_update_available');
    try {
      const fetched = await Updates.fetchUpdateAsync();
      if (fetched?.isNew) {
        await recordOtaEvent('ota_update_fetched');
        const base = await buildBasePayload();
        await persistLastOtaStatus({
          status: 'fetched',
          otaUpdateId: base.otaUpdateId,
          otaChannel: base.otaChannel,
          runtimeVersion: base.runtimeVersion,
          appVersion: base.appVersion,
        });
        await resetRetryState();
        return { status: 'update_downloaded' };
      }
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'not_available',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      await resetRetryState();
      return { status: 'no_update' };
    } catch (e: any) {
      await recordOtaEvent('ota_check_failed', { message: e?.message || 'Fetch failed' });
      const base = await buildBasePayload();
      await persistLastOtaStatus({
        status: 'error',
        message: e?.message || 'Fetch failed',
        otaUpdateId: base.otaUpdateId,
        otaChannel: base.otaChannel,
        runtimeVersion: base.runtimeVersion,
        appVersion: base.appVersion,
      });
      const nextCount = (retryState.count || 0) + 1;
      if (nextCount >= OTA_MAX_FAILURES_BEFORE_DISABLE) {
        await disableOtaTemporarily(nextCount);
      } else {
        await scheduleRetry(nextCount);
      }
      return { status: 'error', message: e?.message || 'Fetch failed' };
    }
  } catch (e: any) {
    await recordOtaEvent('ota_check_failed', { message: e?.message || 'Unknown error' });
    const base = await buildBasePayload();
    await persistLastOtaStatus({
      status: 'error',
      message: e?.message || 'Unknown error',
      otaUpdateId: base.otaUpdateId,
      otaChannel: base.otaChannel,
      runtimeVersion: base.runtimeVersion,
      appVersion: base.appVersion,
    });
    const retryState = await getRetryState();
    const nextCount = (retryState.count || 0) + 1;
    if (nextCount >= OTA_MAX_FAILURES_BEFORE_DISABLE) {
      await disableOtaTemporarily(nextCount);
    } else {
      await scheduleRetry(nextCount);
    }
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
    const base = await buildBasePayload();
    await persistLastOtaStatus({
      status: 'applied',
      otaUpdateId: base.otaUpdateId,
      otaChannel: base.otaChannel,
      runtimeVersion: base.runtimeVersion,
      appVersion: base.appVersion,
    });
    return;
  }

  if (
    previous.appVersion !== current.appVersion ||
    previous.runtimeVersion !== current.runtimeVersion ||
    previous.otaUpdateId !== current.otaUpdateId ||
    previous.otaChannel !== current.otaChannel
  ) {
    await recordOtaEvent('ota_update_applied');
    const base = await buildBasePayload();
    await persistLastOtaStatus({
      status: 'applied',
      otaUpdateId: base.otaUpdateId,
      otaChannel: base.otaChannel,
      runtimeVersion: base.runtimeVersion,
      appVersion: base.appVersion,
    });
  }
};
