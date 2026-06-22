import React from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";

import {
    Box,
    Br,
    Button,
    Text,
    useTheme,
    ApkUpdateBanner,
    OfflineUpdateShare,
    Modal,
} from "@/src/components";
import { ASYNC_STORAGE_KEYS } from "@/src/constants/async-storage";
import {
    checkForOtaUpdateFetchAndRecord,
    getLastOtaStatus,
} from "@/src/update/otaTelemetry";
import { useAppContext } from "@/src/AppContext";
import {
    applyUpdateFlowAfterSync,
    getDownloadState,
    installApkIfSafe,
    NEOTREE_UPDATE_RELEASE,
    setUpdatesScreenFocused,
    startApkDownload,
    type UpdateDecision,
} from "@/src/update";
import { syncData } from "@/src/data";
import * as types from "@/src/types";

const formatStatus = (value?: string | null) => {
    if (!value) return "Unknown";
    return value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
};

const deliveryLabel = (mode?: string | null) => {
    switch (mode) {
        case "mdm":
            return "Managed by administrator";
        case "hybrid":
            return "Administrator managed, app fallback available";
        case "manual":
            return "Manual update";
        case "in_app":
            return "In-app update";
        default:
            return "Not configured";
    }
};

const channelLabel = (value?: string | null) => {
    const channel = `${value || ""}`.trim().toLowerCase();
    if (channel === "production" || channel === "prod") return "Prod";
    if (channel === "stage") return "Stage";
    if (channel === "demo") return "Demo";
    return value || "Unknown";
};

// Decision states that mean an APK update is outstanding for this tablet. Used
// both to decide whether to show the banner and to suppress redundant OTA
// alerts while an APK update is pending.
const APK_PENDING_STATES = [
    "apk_available",
    "apk_forced",
    "mdm_managed",
    "manual_update_required",
];

const isApkUpdatePending = (decision?: UpdateDecision | null) =>
    Boolean(
        decision?.shouldAutoDownload ||
            decision?.shouldForceInstall ||
            APK_PENDING_STATES.includes(`${decision?.state || ""}`),
    );

const isAppAlreadyCurrent = (decision?: UpdateDecision | null) =>
    !decision || decision.state === "runtime_ok";

// States where the tablet is offline / cannot self-update over the air and an
// administrator typically hands over an update file. We surface the offline
// tablet-to-tablet sharing controls inline (not just under "More options") so
// they are reachable without internet.
const MANUAL_OFFLINE_STATES = [
    "manual_update_required",
    "runtime_mismatch_unmanaged",
];

type StatusTone = "success" | "info" | "warning";

// Visual treatment per tone so a warning ("Update required") reads as more
// urgent than neutral info at a glance, instead of every card looking the same.
// `color` is a theme colour key (used for the accent border, icon and title);
// `background` is a theme background key for the card fill.
const TONE_STYLES: Record<
    StatusTone,
    {
        icon: string;
        color: "success" | "info" | "warning";
        background: "bg.active" | "bg.light";
    }
> = {
    success: { icon: "check-circle", color: "success", background: "bg.active" },
    info: { icon: "info", color: "info", background: "bg.light" },
    warning: { icon: "error-outline", color: "warning", background: "bg.light" },
};

// Single source of truth for the "check failed" copy so the inline error and
// the outer catch don't drift apart.
const CHECK_FAILED_MESSAGE =
    "NeoTree could not finish checking for updates. Please check the internet connection and try again.";

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
            title: "Restart needed",
            message:
                "An update has been downloaded. Restart NeoTree to finish.",
            tone: "warning" as const,
        };
    }

    switch (state) {
        case "runtime_ok":
            return {
                title: "NeoTree is up to date",
                message: "No action is needed on this tablet.",
                tone: "success" as const,
            };
        case "apk_available":
            return {
                title: "Update available",
                message:
                    deliveryMode === "hybrid"
                        ? "An administrator can install this update. You can also download it here if instructed."
                        : "A new app update is available for this tablet.",
                tone: "info" as const,
            };
        case "apk_forced":
            return {
                title: "Update required",
                message:
                    "This tablet needs an app update before it is fully up to date.",
                tone: "warning" as const,
            };
        case "mdm_managed":
            return {
                title: "Administrator managed",
                message:
                    "No action is needed here. The administrator will install the update remotely.",
                tone: "info" as const,
            };
        case "manual_update_required":
            return {
                title: "Administrator help needed",
                message:
                    "Please contact an administrator to update this tablet.",
                tone: "warning" as const,
            };
        case "runtime_mismatch_unmanaged":
            return {
                title: "Administrator help needed",
                message:
                    "This tablet needs review before it can be updated safely.",
                tone: "warning" as const,
            };
        case "policy_missing":
            return {
                title: "Status not loaded",
                message: "Check for updates to refresh this tablet.",
                tone: "info" as const,
            };
        default:
            return {
                title: "Check update status",
                message: "Use the button below to refresh this tablet.",
                tone: "info" as const,
            };
    }
};

export function UpdatesCenter({
    navigation,
}: types.StackNavigationProps<types.HomeRoutes, "Updates">) {
    const theme = useTheme();
    const { updateDecision, setUpdateDecision, setSyncDataResponse } =
        useAppContext() || {};
    const [lastStatus, setLastStatus] = React.useState<any>(null);
    const [pendingRestart, setPendingRestart] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const [showMoreOptions, setShowMoreOptions] = React.useState(false);
    const [downloadState, setDownloadState] = React.useState<any>(null);
    // Connectivity is surfaced to the user (chip below the title) and used to
    // gate the network-only "Check for updates" action — an offline-first
    // tablet should be steered to the file-import path instead of tapping a
    // button that can only fail.
    const [online, setOnline] = React.useState(true);

    const isSessionActive = React.useCallback(async () => {
        const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE);
        return v === "true";
    }, []);

    const refreshStatus = React.useCallback(async () => {
        const status = await getLastOtaStatus();
        setLastStatus(status);
        const pending = await AsyncStorage.getItem(
            ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING,
        );
        setPendingRestart(pending === "true");
        setDownloadState(await getDownloadState());
    }, []);

    const setPending = React.useCallback(async (value: boolean) => {
        if (value) {
            await AsyncStorage.setItem(
                ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING,
                "true",
            );
        } else {
            await AsyncStorage.removeItem(
                ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING,
            );
        }
        setPendingRestart(value);
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // While this screen is focused, suppress the global "App update
            // ready" prompt — the install controls are already on this screen.
            setUpdatesScreenFocused(true);
            refreshStatus();
            const id = setInterval(refreshStatus, 5000);
            return () => {
                setUpdatesScreenFocused(false);
                clearInterval(id);
            };
        }, [refreshStatus]),
    );

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setOnline(
                Boolean(state?.isConnected) &&
                    state?.isInternetReachable !== false,
            );
        });
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: ({ tintColor }) => (
                <Box marginRight="m">
                    <TouchableOpacity onPress={() => setShowMoreOptions(true)}>
                        <Icon name="more-vert" size={28} color={tintColor} />
                    </TouchableOpacity>
                </Box>
            ),
        });
    }, [navigation]);

    const handleOtaPrompt = React.useCallback(
        async (
            res: Awaited<ReturnType<typeof checkForOtaUpdateFetchAndRecord>>,
            opts?: { suppressNonActionAlerts?: boolean },
        ) => {
            if (res.status === "update_downloaded") {
                if (await isSessionActive()) {
                    await setPending(true);
                    Alert.alert(
                        "Update ready",
                        "Update will apply when the session is idle or after restart.",
                    );
                    return;
                }
                Alert.alert(
                    "Update ready",
                    "A new update was downloaded. Restart now?",
                    [
                        {
                            text: "Later",
                            style: "cancel",
                            onPress: () => setPending(true).catch(() => null),
                        },
                        {
                            text: "Restart now",
                            onPress: () => {
                                setPending(false).catch(() => null);
                                Updates.reloadAsync().catch(() => null);
                            },
                        },
                    ],
                );
                return;
            }

            if (res.status === "no_update") {
                if (opts?.suppressNonActionAlerts) return;
                Alert.alert("No updates", "This tablet is already up to date.");
                return;
            }

            if (res.status === "offline") {
                if (opts?.suppressNonActionAlerts) return;
                Alert.alert(
                    "Offline",
                    "Connect to the internet and try again.",
                );
                return;
            }

            if (res.status === "disabled") {
                if (opts?.suppressNonActionAlerts) return;
                Alert.alert(
                    "Temporarily paused",
                    res.message || "OTA checks are temporarily paused.",
                );
                return;
            }

            if (res.status === "deferred") {
                if (opts?.suppressNonActionAlerts) return;
                Alert.alert(
                    "Retry scheduled",
                    res.message || "A retry is already scheduled.",
                );
                return;
            }

            if (res.status === "error") {
                if (opts?.suppressNonActionAlerts) return;
                Alert.alert(
                    "Could not check for updates",
                    res.message || CHECK_FAILED_MESSAGE,
                );
            }
        },
        [isSessionActive, setPending],
    );

    const handleCheckForUpdates = React.useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await syncData({ force: true });
            if (setSyncDataResponse) setSyncDataResponse(res);

            // The APK decision and the OTA check are independent channels: a
            // failure in one must not cancel the other. Capture each error and
            // surface a single message at the end rather than short-circuiting.
            let apkUpdatePending = false;
            let appAlreadyCurrent = true;
            let decisionError: any = null;
            try {
                const decision = await applyUpdateFlowAfterSync();
                if (setUpdateDecision) setUpdateDecision(decision);
                apkUpdatePending = isApkUpdatePending(decision);
                appAlreadyCurrent = isAppAlreadyCurrent(decision);
            } catch (e) {
                decisionError = e;
            }

            let otaRes: Awaited<
                ReturnType<typeof checkForOtaUpdateFetchAndRecord>
            > | null = null;
            let otaError: any = null;
            try {
                otaRes = await checkForOtaUpdateFetchAndRecord({
                    force: true,
                });
            } catch (e) {
                otaError = e;
            }

            await refreshStatus();

            if (decisionError || otaError) {
                if (otaRes?.status === "update_downloaded") {
                    await handleOtaPrompt(otaRes);
                    return;
                }
                if (
                    appAlreadyCurrent &&
                    otaRes?.status === "error" &&
                    otaRes.nonBlocking
                ) {
                    return;
                }
                throw decisionError || otaError;
            }

            if (otaRes) {
                if (
                    appAlreadyCurrent &&
                    otaRes.status === "error" &&
                    otaRes.nonBlocking
                ) {
                    return;
                }
                await handleOtaPrompt(otaRes, {
                    suppressNonActionAlerts: apkUpdatePending,
                });
            }
        } catch (e: any) {
            Alert.alert(
                "Could not check for updates",
                e?.message || CHECK_FAILED_MESSAGE,
            );
        } finally {
            setRefreshing(false);
        }
    }, [
        handleOtaPrompt,
        refreshStatus,
        setSyncDataResponse,
        setUpdateDecision,
    ]);

    const appVersion = Constants.expoConfig?.version || "Unknown";
    const runtimeVersion =
        (Constants as any).runtimeVersion ||
        Constants.expoConfig?.runtimeVersion ||
        "Unknown";
    const otaUpdateId = Updates.updateId ? `${Updates.updateId}` : "embedded";
    const otaChannel = (Updates as any).channel || "unknown";
    const deliveryMode =
        updateDecision?.deliveryMode ||
        updateDecision?.policy?.apk?.deliveryMode ||
        null;
    const currentApk = updateDecision?.currentApk;
    const lastChecked = formatDateTime(lastStatus?.checkedAt);
    const status = statusCopy({
        state: updateDecision?.state,
        pendingRestart,
        deliveryMode,
    });
    const tone = TONE_STYLES[status.tone as StatusTone] || TONE_STYLES.info;
    const lastStatusMessage =
        status.tone === "success" && lastStatus?.status === "error"
            ? null
            : lastStatus?.message;

    const decisionState = `${updateDecision?.state || ""}`;
    const isApkState =
        decisionState === "apk_available" || decisionState === "apk_forced";
    // Pure in-app delivery: the card owns the primary download/install action.
    // Hybrid is deliberately left to the (cautious) banner so we never promote
    // installing an update an administrator is expected to manage.
    const isInAppOnly =
        isApkState && (deliveryMode === "in_app" || !deliveryMode);
    const isDownloading = downloadState?.status === "downloading";
    const isPaused = downloadState?.status === "paused";

    // A verified download for the current target release that can be installed
    // right here, without internet.
    const readyToInstall =
        isInAppOnly &&
        downloadState?.status === "verified" &&
        !!downloadState?.fileUri &&
        !!currentApk?.apkReleaseId &&
        downloadState?.apkReleaseId === currentApk.apkReleaseId
            ? (downloadState.fileUri as string)
            : null;

    // Surface the offline file-sharing path whenever the tablet needs an update
    // it cannot fetch over the air right now — either an administrator-managed
    // state, or an in-app update with no internet to download it.
    const showOfflineSharePath =
        MANUAL_OFFLINE_STATES.includes(decisionState) ||
        (isApkState && !online);

    const handleRestart = React.useCallback(async () => {
        await setPending(false);
        Updates.reloadAsync().catch(() => null);
    }, [setPending]);

    const handleInstall = React.useCallback(async () => {
        if (!readyToInstall) return;
        try {
            await installApkIfSafe(readyToInstall, currentApk);
        } catch (e: any) {
            Alert.alert(
                "Install blocked",
                e?.message || "NeoTree could not open the installer.",
            );
        }
    }, [readyToInstall, currentApk]);

    const handleDownload = React.useCallback(async () => {
        if (!currentApk) return;
        try {
            await startApkDownload(currentApk);
            await refreshStatus();
        } catch (e: any) {
            Alert.alert(
                "Download failed",
                e?.message || "NeoTree could not start the download.",
            );
        }
    }, [currentApk, refreshStatus]);

    // The single hero action shown in the status card. Network-only actions are
    // disabled (with a helper line) when offline so the user is steered to the
    // file-import path instead of a button that can only fail.
    const primaryAction: {
        label: string;
        onPress?: () => void | Promise<void>;
        disabled?: boolean;
        helper?: string | null;
    } = (() => {
        if (pendingRestart) {
            return { label: "Restart NeoTree", onPress: handleRestart };
        }
        if (refreshing) {
            return { label: "Checking...", disabled: true };
        }
        if (isInAppOnly) {
            if (readyToInstall) {
                return { label: "Install update", onPress: handleInstall };
            }
            if (isDownloading) {
                return { label: "Downloading…", disabled: true };
            }
            if (isPaused) {
                // A user-paused download resumes from where it left off; it is never
                // auto-resumed by the background controller, so the card owns this.
                return { label: "Resume download", onPress: handleDownload };
            }
            if (!online) {
                return {
                    label: "Download update",
                    disabled: true,
                    helper: "Connect to the internet to download, or install from a file below.",
                };
            }
            return { label: "Download update", onPress: handleDownload };
        }
        if (showOfflineSharePath && !online) {
            return {
                label: "Check for updates",
                disabled: true,
                helper: "No internet connection. Install from a file below.",
            };
        }
        if (!online) {
            return {
                label: "Check for updates",
                disabled: true,
                helper: "No internet connection.",
            };
        }
        return { label: "Check for updates", onPress: handleCheckForUpdates };
    })();

    // Gate on the decision state (which already encodes "this tablet needs the
    // update"), not on currentApk.available — the latter is a server rollout
    // flag that stays true even when the tablet is already up to date.
    const shouldShowApkBanner = APK_PENDING_STATES.includes(decisionState);

    return (
        <>
            <ScrollView contentContainerStyle={{ padding: theme.spacing.l }}>
                <Text variant="title3" fontWeight="bold">
                    App updates
                </Text>

                <Br spacing="s" />

                <Text color="textSecondary">
                    Keep this tablet updated so NeoTree can continue working safely.
                </Text>

                <Br spacing="s" />

                <Box flexDirection="row" alignItems="center">
                    <Icon
                        name={online ? "wifi" : "wifi-off"}
                        size={14}
                        color={
                            online
                                ? theme.colors.success
                                : theme.colors.textSecondary
                        }
                    />
                    <Text variant="caption" color="textSecondary" marginLeft="s">
                        {online
                            ? "Online"
                            : "Offline — you can still install from a file"}
                    </Text>
                </Box>

                <Br spacing="m" />

                <Box
                    padding="m"
                    backgroundColor={tone.background}
                    borderRadius="m"
                    borderLeftWidth={4}
                    borderColor={tone.color}
                >
                    <Box flexDirection="row" alignItems="center">
                        <Icon
                            name={tone.icon as any}
                            size={20}
                            color={theme.colors[tone.color]}
                        />
                        <Text
                            fontWeight="bold"
                            color={tone.color}
                            marginLeft="s"
                        >
                            {status.title}
                        </Text>
                    </Box>

                    <Br spacing="s" />

                    <Text color="textSecondary">{status.message}</Text>

                    {currentApk?.versionName ? (
                        <>
                            <Br spacing="s" />
                            <Text color="textSecondary">
                                Available version: {currentApk.versionName}
                            </Text>
                        </>
                    ) : null}

                    <Br spacing="m" />

                    <Button
                        onPress={primaryAction.onPress}
                        disabled={
                            primaryAction.disabled || !primaryAction.onPress
                        }
                    >
                        {primaryAction.label}
                    </Button>

                    {primaryAction.helper ? (
                        <>
                            <Br spacing="s" />
                            <Text variant="caption" color="textSecondary">
                                {primaryAction.helper}
                            </Text>
                        </>
                    ) : null}

                    <Br spacing="s" />

                    <Text color="textSecondary">
                        {lastChecked
                            ? `Last checked ${lastChecked}`
                            : "No update check has been completed yet."}
                    </Text>

                    {lastStatusMessage ? (
                        <>
                            <Br spacing="s" />
                            <Text color="textSecondary">{lastStatusMessage}</Text>
                        </>
                    ) : null}
                </Box>

                {showOfflineSharePath ? (
                    <>
                        <Br spacing="m" />
                        <Text color="textSecondary">
                            No internet on this tablet? An administrator can hand
                            you the update file to install here.
                        </Text>
                        <Br spacing="s" />
                        <OfflineUpdateShare />
                    </>
                ) : null}

                {shouldShowApkBanner ? (
                    <>
                        <Br spacing="m" />
                        <ApkUpdateBanner
                            cardOwnsPrimaryInstall={isInAppOnly}
                        />
                    </>
                ) : null}
            </ScrollView>

            <Modal
                open={showMoreOptions}
                onClose={() => setShowMoreOptions(false)}
                onRequestClose={() => setShowMoreOptions(false)}
                title="More options"
                actions={[
                    {
                        label: "Close",
                        onPress: () => setShowMoreOptions(false),
                    },
                ]}
            >
                <TouchableOpacity onPress={() => setShowDetails((value) => !value)}>
                    <Box padding="m" backgroundColor="bg.light" borderRadius="m">
                        <Text fontWeight="bold">Technical information</Text>

                        <Br spacing="s" />

                        <Text color="textSecondary">
                            {showDetails
                                ? "Hide app version and update details."
                                : "View app version, runtime, channel, and update status."}
                        </Text>
                    </Box>
                </TouchableOpacity>

                {showDetails ? (
                    <>
                        <Br spacing="m" />

                        <Box padding="m" backgroundColor="bg.light" borderRadius="m">
                            <Text fontWeight="bold">Installed app</Text>

                            <Br spacing="s" />

                            <Text>Version: {appVersion}</Text>
                            <Text>
                                Update release: {NEOTREE_UPDATE_RELEASE.label}
                            </Text>
                            <Text>Runtime: {runtimeVersion}</Text>
                            <Text>Channel: {channelLabel(otaChannel)}</Text>
                            <Text>Delivery: {deliveryLabel(deliveryMode)}</Text>

                            <Br spacing="s" />

                            <Text color="textSecondary">
                                Update ID: {otaUpdateId || "Not available"}
                            </Text>

                            <Text color="textSecondary">
                                Decision: {formatStatus(updateDecision?.state)}
                            </Text>
                        </Box>
                    </>
                ) : null}

                <Br spacing="m" />

                <Text fontWeight="bold">Offline update sharing</Text>

                <Br spacing="s" />

                <Text color="textSecondary">
                    Use this only when an administrator asks you to move updates
                    between tablets without internet.
                </Text>

                <Br spacing="m" />

                <OfflineUpdateShare showHeader={false} />
            </Modal>
        </>
    );
}
