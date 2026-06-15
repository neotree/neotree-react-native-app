import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppContext } from '@/src/AppContext';
import { ASYNC_STORAGE_KEYS } from '@/src/constants/async-storage';
import {
  getDownloadState,
  installApkIfSafe,
  resumeApkDownload,
  scheduleRetry,
  shouldRetryNow,
  startApkDownload,
} from '@/src/update';

/**
 * #12 — Enforces required app updates. When the policy marks an update as forced
 * (apkForceInstall within the force window) this overlays a non-dismissable
 * screen so the tablet cannot keep running an out-of-date build.
 *
 * Safety: it never appears while a clinical session is active, so a forced
 * update can never interrupt data capture mid-session. It surfaces once the
 * tablet is idle.
 */
export function ForcedUpdateGate() {
  const { updateDecision } = useAppContext() || {};
  const [sessionActive, setSessionActive] = React.useState(true);
  const [state, setState] = React.useState<any>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const active = (await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE)) === 'true';
      const s = await getDownloadState();
      if (!mounted) return;
      setSessionActive(active);
      setState(s);
    };
    refresh();
    const id = setInterval(refresh, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (!updateDecision?.shouldForceInstall) return null;
  if (sessionActive) return null; // never block during an active session

  const release = updateDecision.currentApk;
  const deliveryMode = updateDecision.deliveryMode || updateDecision.policy?.apk?.deliveryMode || 'in_app';
  const canUseInAppDownload = deliveryMode === 'in_app' || deliveryMode === 'hybrid';
  const isDownloading = state?.status === 'downloading';
  const isDownloaded = state?.status === 'verified';
  const progress = state?.totalBytes ? Math.min(1, (state?.bytesWritten || 0) / state.totalBytes) : null;

  const onDownload = async () => {
    if (!release) return;
    if (!(await shouldRetryNow())) {
      setMessage('Retry scheduled. Please wait a moment.');
      return;
    }
    try {
      await startApkDownload(release);
    } catch (e: any) {
      await scheduleRetry(10);
      setMessage(e?.message || 'Download failed. Retry scheduled.');
    }
  };

  const onResume = async () => {
    if (!release) return;
    try {
      await resumeApkDownload(release);
    } catch (e: any) {
      await scheduleRetry(10);
      setMessage(e?.message || 'Resume failed. Retry scheduled.');
    }
  };

  const onInstall = async () => {
    try {
      if (!state?.fileUri) throw new Error('Update file is not ready yet.');
      await installApkIfSafe(state.fileUri, release || undefined);
    } catch (e: any) {
      setMessage(e?.message || 'Install blocked.');
    }
  };

  const adminManaged = deliveryMode === 'mdm' || deliveryMode === 'manual';

  return (
    <Modal visible transparent={false} animationType="fade" onRequestClose={() => null}>
      <View style={styles.container}>
        <Text style={styles.title}>Required update</Text>
        <Text style={styles.body}>
          This tablet must be updated before it can be used again.
          {release ? ` Target version ${release.versionName}.` : ''}
        </Text>

        {adminManaged ? (
          <Text style={styles.body}>
            {deliveryMode === 'mdm'
              ? 'Your administrator is installing this update remotely. Please wait, or contact them if this does not clear shortly.'
              : 'Please contact your administrator to update this tablet.'}
          </Text>
        ) : null}

        {progress !== null ? (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        ) : null}

        {message ? <Text style={styles.error}>{message}</Text> : null}

        {canUseInAppDownload ? (
          <View style={styles.actions}>
            {!isDownloaded && !isDownloading ? (
              <TouchableOpacity style={styles.primary} onPress={onDownload}>
                <Text style={styles.primaryText}>Download update</Text>
              </TouchableOpacity>
            ) : null}
            {isDownloading ? <Text style={styles.body}>Downloading…</Text> : null}
            {!isDownloading && state?.status === 'failed' ? (
              <TouchableOpacity style={styles.primary} onPress={onResume}>
                <Text style={styles.primaryText}>Resume download</Text>
              </TouchableOpacity>
            ) : null}
            {isDownloaded ? (
              <TouchableOpacity style={styles.primary} onPress={onInstall}>
                <Text style={styles.primaryText}>Install update</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  body: { fontSize: 15, color: '#334155', marginBottom: 12, lineHeight: 22 },
  error: { fontSize: 13, color: '#B91C1C', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: 8, backgroundColor: '#70A487' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  primary: { backgroundColor: '#70A487', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  primaryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});
