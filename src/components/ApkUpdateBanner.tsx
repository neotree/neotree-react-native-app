import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Battery from 'expo-battery';

import { useAppContext } from '@/src/AppContext';
import {
  getDownloadState,
  pauseApkDownload,
  resumeApkDownload,
  installApkIfSafe,
  startApkDownload,
  deferInstall,
  getInstallDefer,
  scheduleRetry,
  shouldRetryNow,
} from '@/src/update';

export function ApkUpdateBanner() {
  const { updateDecision } = useAppContext() || {};
  const [state, setState] = React.useState<any>(null);
  const [installDefer, setInstallDefer] = React.useState<'idle' | 'restart' | null>(null);
  const [envMessage, setEnvMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      const s = await getDownloadState();
      if (mounted) setState(s);
      const defer = await getInstallDefer();
      if (mounted) setInstallDefer(defer);
    };

    refresh();
    const id = setInterval(refresh, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!updateDecision?.currentApk) return;

      const free = await FileSystem.getFreeDiskStorageAsync();
      const size = updateDecision.currentApk.fileSize || 0;
      if (size && free < size + 100 * 1024 * 1024) {
        setEnvMessage('Not enough storage to download the update.');
        return;
      }

      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();
        if (state !== Battery.BatteryState.CHARGING && state !== Battery.BatteryState.FULL && level < 0.2) {
          setEnvMessage('Battery too low to download the update.');
          return;
        }
      } catch {
        // ignore
      }

      setEnvMessage(null);
    })();
  }, [updateDecision?.currentApk]);

  if (!updateDecision?.currentApk || !updateDecision?.currentApk?.available) return null;

  const release = updateDecision.currentApk;
  const isDownloading = state?.status === 'downloading';
  const isDownloaded = state?.status === 'verified';
  const hasError = state?.status === 'failed';

  const progress = state?.totalBytes
    ? Math.min(1, (state?.bytesWritten || 0) / state.totalBytes)
    : null;

  const onDownload = async () => {
    if (!(await shouldRetryNow())) {
      setEnvMessage('Retry scheduled. Please wait a moment.');
      return;
    }
    try {
      await startApkDownload(release);
    } catch (e: any) {
      await scheduleRetry(10);
      setEnvMessage(e?.message || 'Download failed. Retry scheduled.');
    }
  };

  const onResume = async () => {
    try {
      await resumeApkDownload(release);
    } catch (e: any) {
      await scheduleRetry(10);
      setEnvMessage(e?.message || 'Resume failed. Retry scheduled.');
    }
  };

  const onInstall = async () => {
    try {
      if (!state?.fileUri) throw new Error('Update file is not ready yet.');
      await installApkIfSafe(state?.fileUri, release);
    } catch (e: any) {
      setEnvMessage(e?.message || 'Install blocked.');
    }
  };

  const onInstallLater = async (mode: 'idle' | 'restart') => {
    await deferInstall(mode);
    setInstallDefer(mode);
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>App update ready</Text>
      <Text style={styles.subtitle}>Version {release.versionName}</Text>

      {progress !== null ? (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      ) : null}

      {envMessage ? (
        <Text style={styles.infoText}>{envMessage}</Text>
      ) : null}

      {hasError ? (
        <Text style={styles.errorText}>{state?.error || 'Download failed'}</Text>
      ) : null}

      {installDefer ? (
        <Text style={styles.infoText}>Install deferred: {installDefer}</Text>
      ) : null}

      <View style={styles.actions}>
        {!isDownloaded && !isDownloading ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDownload}
          >
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        ) : null}

        {isDownloading ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => pauseApkDownload().catch(() => null)}>
            <Text style={styles.actionText}>Pause</Text>
          </TouchableOpacity>
        ) : null}

        {!isDownloading && state?.status === 'failed' ? (
          <TouchableOpacity style={styles.actionButton} onPress={onResume}>
            <Text style={styles.actionText}>Resume</Text>
          </TouchableOpacity>
        ) : null}

        {isDownloaded ? (
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={onInstall}>
            <Text style={styles.actionPrimaryText}>Install</Text>
          </TouchableOpacity>
        ) : null}

        {isDownloaded ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => onInstallLater('idle')}>
            <Text style={styles.actionText}>Install when idle</Text>
          </TouchableOpacity>
        ) : null}

        {isDownloaded ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => onInstallLater('restart')}>
            <Text style={styles.actionText}>Install on restart</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F1F5F9',
    borderBottomColor: '#CBD5E1',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#475569', marginTop: 2 },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#0EA5E9',
  },
  errorText: { color: '#B91C1C', marginTop: 6, fontSize: 12 },
  infoText: { color: '#475569', marginTop: 6, fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  actionText: { color: '#0F172A', fontSize: 12 },
  actionButtonPrimary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0EA5E9',
    borderRadius: 6,
  },
  actionPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
