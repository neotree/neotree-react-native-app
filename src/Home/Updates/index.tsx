import React from 'react';
import { Alert, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { Box, Br, Button, Text, useTheme, ApkUpdateBanner } from '@/src/components';
import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import { checkForOtaUpdateFetchAndRecord, getLastOtaStatus } from '@/src/update/otaTelemetry';
import { useAppContext } from '@/src/AppContext';
import { getUpdateDecision } from '@/src/update';
import { syncData } from '@/src/data';

export function UpdatesCenter() {
  const theme = useTheme();
  const { updateDecision, setUpdateDecision, setSyncDataResponse } = useAppContext() || {};
  const [lastStatus, setLastStatus] = React.useState<any>(null);
  const [pendingRestart, setPendingRestart] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const isSessionActive = React.useCallback(async () => {
    const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE);
    return v === 'true';
  }, []);

  const refreshStatus = React.useCallback(async () => {
    const status = await getLastOtaStatus();
    setLastStatus(status);
    const pending = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING);
    setPendingRestart(pending === 'true');
  }, []);

  const setPending = React.useCallback(async (value: boolean) => {
    if (value) {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING, 'true');
    } else {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING);
    }
    setPendingRestart(value);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshStatus();
      const id = setInterval(refreshStatus, 5000);
      return () => clearInterval(id);
    }, [refreshStatus]),
  );

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await checkForOtaUpdateFetchAndRecord({ force: true });
      await refreshStatus();
      if (res.status === 'update_downloaded') {
        if (await isSessionActive()) {
          await setPending(true);
          Alert.alert('Update ready', 'Update will apply when the session is idle or after restart.');
          return;
        }
        Alert.alert(
          'Update ready',
          'A new update was downloaded. Restart now?',
          [
            { 
              text: 'Later', 
              style: 'cancel',
              onPress: () => setPending(true).catch(() => null),
            },
            { 
              text: 'Restart now', 
              onPress: () => {
                setPending(false).catch(() => null);
                Updates.reloadAsync().catch(() => null);
              },
            },
          ],
        );
      } else if (res.status === 'no_update') {
        Alert.alert('No updates', 'Your app is up to date.');
      } else if (res.status === 'offline') {
        Alert.alert('Offline', 'Connect to the internet and try again.');
      } else if (res.status === 'disabled') {
        Alert.alert('Temporarily paused', res.message || 'OTA checks are temporarily paused.');
      } else if (res.status === 'deferred') {
        Alert.alert('Retry scheduled', res.message || 'A retry is already scheduled.');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await syncData({ force: true });
      if (setSyncDataResponse) setSyncDataResponse(res);
      if (setUpdateDecision) setUpdateDecision(await getUpdateDecision());
    } finally {
      setSyncing(false);
    }
  };

  const appVersion = Constants.expoConfig?.version || 'Unknown';
  const runtimeVersion = (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || 'Unknown';
  const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : 'embedded';
  const otaChannel = (Updates as any).channel || 'unknown';

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.l }}>
      <Text variant="title3" fontWeight="bold">Update Center</Text>
      <Br spacing="m" />

      <Box padding="m" backgroundColor="bg.light" borderRadius="m">
        <Text fontWeight="bold">Current</Text>
        <Br spacing="s" />
        <Text>Version: {appVersion}</Text>
        <Text>Runtime: {runtimeVersion}</Text>
        <Text>Channel: {otaChannel}</Text>
        <Text>Update ID: {otaUpdateId}</Text>
      </Box>

      <Br spacing="m" />

      <Box padding="m" backgroundColor="bg.light" borderRadius="m">
        <Text fontWeight="bold">Last OTA Check</Text>
        <Br spacing="s" />
        <Text>Status: {lastStatus?.status || 'unknown'}</Text>
        {lastStatus?.message ? <Text>Message: {lastStatus.message}</Text> : null}
        {lastStatus?.checkedAt ? <Text>Checked: {lastStatus.checkedAt}</Text> : null}
        {pendingRestart ? <Text color="warning">Pending restart to apply update</Text> : null}
      </Box>

      <Br spacing="m" />

      <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
        <Button onPress={handleManualCheck} disabled={checking}>
          {checking ? 'Checking…' : 'Check for OTA Update'}
        </Button>
        <Button onPress={handleSyncNow} disabled={syncing} color="secondary">
          {syncing ? 'Syncing…' : 'Sync & Refresh Policy'}
        </Button>
        <Button
          onPress={() => {
            setPending(false).catch(() => null);
            Updates.reloadAsync().catch(() => null);
          }}
          disabled={!pendingRestart}
          color="warning"
        >
          Restart to Apply
        </Button>
      </Box>

      <Br spacing="m" />

      <Box padding="m" backgroundColor="bg.light" borderRadius="m">
        <Text fontWeight="bold">APK Updates</Text>
        <Br spacing="s" />
        <Text>Decision: {updateDecision?.state || 'unknown'}</Text>
        {updateDecision?.policyRuntimeVersion ? (
          <Text>Policy runtime: {updateDecision.policyRuntimeVersion}</Text>
        ) : null}
        {updateDecision?.runtimeVersion ? (
          <Text>Current runtime: {updateDecision.runtimeVersion}</Text>
        ) : null}
      </Box>

      <Br spacing="m" />
      <ApkUpdateBanner />
    </ScrollView>
  );
}
