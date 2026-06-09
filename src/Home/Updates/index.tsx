import React from 'react';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
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

const formatStatus = (value?: string | null) => {
  if (!value) return 'Unknown';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const deliveryLabel = (mode?: string | null) => {
  switch (mode) {
    case 'mdm':
      return 'Managed by administrator';
    case 'hybrid':
      return 'Administrator managed, app fallback available';
    case 'manual':
      return 'Manual update';
    case 'in_app':
      return 'In-app update';
    default:
      return 'Not configured';
  }
};

const channelLabel = (value?: string | null) => {
  const channel = `${value || ''}`.trim().toLowerCase();
  if (channel === 'production' || channel === 'prod') return 'Prod';
  if (channel === 'stage') return 'Stage';
  if (channel === 'demo') return 'Demo';
  return value || 'Unknown';
};

const statusCopy = ({
  state,
  pendingRestart,
  deliveryMode,
}: {
  state?: string | null;
  pendingRestart: boolean;
  deliveryMode?: string | null;
}) => {
  if (pendingRestart) {
    return {
      title: 'Restart needed',
      message: 'An update has been downloaded. Restart NeoTree to finish.',
      action: 'Restart NeoTree',
      tone: 'warning' as const,
    };
  }

  switch (state) {
    case 'runtime_ok':
      return {
        title: 'NeoTree is up to date',
        message: 'No action is needed on this tablet.',
        action: 'Refresh update status',
        tone: 'success' as const,
      };
    case 'apk_available':
      return {
        title: 'Update available',
        message: deliveryMode === 'hybrid'
          ? 'An administrator can install this update. You can also download it here if instructed.'
          : 'A new app update is available for this tablet.',
        action: 'Refresh update status',
        tone: 'info' as const,
      };
    case 'apk_forced':
      return {
        title: 'Update required',
        message: 'This tablet needs an app update before it is fully up to date.',
        action: 'Refresh update status',
        tone: 'warning' as const,
      };
    case 'mdm_managed':
      return {
        title: 'Administrator managed',
        message: 'No action is needed here. The administrator will install the update remotely.',
        action: 'Refresh update status',
        tone: 'info' as const,
      };
    case 'manual_update_required':
      return {
        title: 'Administrator help needed',
        message: 'Please contact an administrator to update this tablet.',
        action: 'Refresh update status',
        tone: 'warning' as const,
      };
    case 'runtime_mismatch_unmanaged':
      return {
        title: 'Administrator help needed',
        message: 'This tablet needs review before it can be updated safely.',
        action: 'Refresh update status',
        tone: 'warning' as const,
      };
    case 'policy_missing':
      return {
        title: 'Status not loaded',
        message: 'Refresh update status to check whether this tablet needs an update.',
        action: 'Refresh update status',
        tone: 'info' as const,
      };
    default:
      return {
        title: 'Check update status',
        message: 'Refresh update status to check whether this tablet needs an update.',
        action: 'Refresh update status',
        tone: 'info' as const,
      };
  }
};

export function UpdatesCenter() {
  const theme = useTheme();
  const { updateDecision, setUpdateDecision, setSyncDataResponse } = useAppContext() || {};
  const [lastStatus, setLastStatus] = React.useState<any>(null);
  const [pendingRestart, setPendingRestart] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

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
        Alert.alert('Update ready', 'A new update was downloaded. Restart now?', [
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
        ]);
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
      await refreshStatus();
    } finally {
      setSyncing(false);
    }
  };

  const appVersion = Constants.expoConfig?.version || 'Unknown';
  const runtimeVersion = (Constants as any).runtimeVersion || Constants.expoConfig?.runtimeVersion || 'Unknown';
  const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : 'embedded';
  const otaChannel = (Updates as any).channel || 'unknown';
  const deliveryMode = updateDecision?.deliveryMode || updateDecision?.policy?.apk?.deliveryMode || null;
  const currentApk = updateDecision?.currentApk;
  const lastChecked = formatDateTime(lastStatus?.checkedAt);
  const status = statusCopy({
    state: updateDecision?.state,
    pendingRestart,
    deliveryMode,
  });
  const statusBackground = status.tone === 'success' ? 'bg.active' : 'bg.light';

  const handlePrimaryAction = async () => {
    if (pendingRestart) {
      await setPending(false);
      Updates.reloadAsync().catch(() => null);
      return;
    }
    await handleSyncNow();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.l }}>
      <Text variant="title3" fontWeight="bold">Update Center</Text>
      <Br spacing="m" />

      <Box padding="m" backgroundColor={statusBackground} borderRadius="m">
        <Text fontWeight="bold">{status.title}</Text>
        <Br spacing="s" />
        <Text color="textSecondary">{status.message}</Text>
        {currentApk ? (
          <>
            <Br spacing="s" />
            <Text color="textSecondary">Target version: {currentApk.versionName}</Text>
          </>
        ) : null}
        <Br spacing="m" />
        <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
          <Button onPress={handlePrimaryAction} disabled={syncing}>
            {pendingRestart ? 'Restart NeoTree' : syncing ? 'Refreshing...' : status.action}
          </Button>
          <Button onPress={handleManualCheck} disabled={checking} color="secondary">
            {checking ? 'Checking...' : 'Check for app update'}
          </Button>
        </Box>
      </Box>

      <Br spacing="m" />

      <ApkUpdateBanner />

      <Br spacing="m" />

      <Box padding="m" backgroundColor="bg.light" borderRadius="m">
        <Text fontWeight="bold">Last check</Text>
        <Br spacing="s" />
        <Text>Status: {formatStatus(lastStatus?.status)}</Text>
        {lastStatus?.message ? <Text color="textSecondary">{lastStatus.message}</Text> : null}
        {lastChecked ? <Text color="textSecondary">Checked: {lastChecked}</Text> : null}
      </Box>

      <Br spacing="m" />

      <TouchableOpacity onPress={() => setShowDetails((value) => !value)}>
        <Box padding="m" backgroundColor="bg.light" borderRadius="m">
          <Text fontWeight="bold">{showDetails ? 'Hide technical details' : 'Show technical details'}</Text>
          <Br spacing="s" />
          <Text color="textSecondary">Version, channel, delivery mode, and update identifiers.</Text>
        </Box>
      </TouchableOpacity>

      {showDetails ? (
        <>
          <Br spacing="m" />
          <Box padding="m" backgroundColor="bg.light" borderRadius="m">
            <Text fontWeight="bold">Installed app</Text>
            <Br spacing="s" />
            <Text>Version: {appVersion}</Text>
            <Text>Runtime: {runtimeVersion}</Text>
            <Text>Channel: {channelLabel(otaChannel)}</Text>
            <Text>Delivery: {deliveryLabel(deliveryMode)}</Text>
            <Text color="textSecondary">Update ID: {otaUpdateId}</Text>
            <Text color="textSecondary">Decision: {formatStatus(updateDecision?.state)}</Text>
          </Box>
        </>
      ) : null}

      <Br spacing="m" />

      <Box padding="m" backgroundColor="bg.light" borderRadius="m">
        <Text fontWeight="bold">Support actions</Text>
        <Br spacing="s" />
        <Text color="textSecondary">Use these if an administrator asks you to refresh this tablet.</Text>
        <Br spacing="s" />
        <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
          <Button onPress={handleSyncNow} disabled={syncing}>
            {syncing ? 'Refreshing...' : 'Refresh update status'}
          </Button>
          <Button onPress={handleManualCheck} disabled={checking} color="secondary">
            {checking ? 'Checking...' : 'Check for app update'}
          </Button>
          <Button
            onPress={() => {
              setPending(false).catch(() => null);
              Updates.reloadAsync().catch(() => null);
            }}
            disabled={!pendingRestart}
            color="warning"
          >
            Restart NeoTree
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
}
