import React from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";

import {
    hasShareableUpdate,
    importUpdateFromFile,
    installImportedApk,
    shareUpdateFile,
    type ImportedApk,
} from "@/src/update";

type OfflineUpdateShareProps = {
    showHeader?: boolean;
};

export function OfflineUpdateShare({
    showHeader = true,
}: OfflineUpdateShareProps) {
    const [busy, setBusy] = React.useState<null | "import" | "share">(null);
    const [canShare, setCanShare] = React.useState(false);

    const refresh = React.useCallback(async () => {
        setCanShare(await hasShareableUpdate());
    }, []);

    React.useEffect(() => {
        refresh();
        const id = setInterval(refresh, 3000);
        return () => clearInterval(id);
    }, [refresh]);

    const doInstall = React.useCallback(async (imported: ImportedApk) => {
        try {
            await installImportedApk(imported);
        } catch (e: any) {
            Alert.alert("Could not install", e?.message || "Please try again.");
        }
    }, []);

    const confirmAndInstall = React.useCallback(
        (imported: ImportedApk) => {
            if (imported.wrongPackage) {
                Alert.alert(
                    "This is a different app",
                    "This file is not a NeoTree update. It is a different Android app, so it was not installed.",
                    [{ text: "OK", style: "cancel" }],
                );
                return;
            }

            if (imported.isDowngrade) {
                Alert.alert(
                    "Update is older than this tablet",
                    "This file is an older version than the one already installed. Ask your administrator for the latest update.",
                    [{ text: "OK", style: "cancel" }],
                );
                return;
            }

            if (imported.verifiedAgainstPolicy) {
                Alert.alert(
                    "Update checked",
                    `This is the approved NeoTree update${imported.matchedVersionName ? ` (version ${imported.matchedVersionName})` : ""}. Install it now?`,
                    [
                        { text: "Not now", style: "cancel" },
                        { text: "Install", onPress: () => doInstall(imported) },
                    ],
                );
                return;
            }

            if (imported.trustedByPackageInspection) {
                Alert.alert(
                    "NeoTree update found",
                    "This tablet could not check the rollout policy, but the file is a NeoTree app update and is not older than the installed version. Install it now?",
                    [
                        { text: "Not now", style: "cancel" },
                        { text: "Install", onPress: () => doInstall(imported) },
                    ],
                );
                return;
            }

            const message = imported.couldCheck
                ? "This file does not match the approved update on this tablet. Ask your NeoTree administrator for the approved update file."
                : "This tablet cannot verify this update file. Connect to the internet to refresh update information, or ask your NeoTree administrator for the approved update file.";

            Alert.alert("Update cannot be verified", message, [
                { text: "OK", style: "cancel" },
            ]);
        },
        [doInstall],
    );

    const onImport = React.useCallback(async () => {
        setBusy("import");
        try {
            const imported = await importUpdateFromFile();
            if (imported) confirmAndInstall(imported);
        } catch (e: any) {
            Alert.alert(
                "Could not open file",
                e?.message || "Please choose the NeoTree update file (.apk).",
            );
        } finally {
            setBusy(null);
        }
    }, [confirmAndInstall]);

    const onShare = React.useCallback(async () => {
        setBusy("share");
        try {
            await shareUpdateFile();
        } catch (e: any) {
            Alert.alert(
                "Nothing to share yet",
                e?.message ||
                    "This tablet does not have an update file to share yet.",
            );
        } finally {
            setBusy(null);
        }
    }, []);

    return (
        <View style={styles.card}>
            {showHeader ? (
                <>
                    <Text style={styles.title}>
                        No internet? Share updates tablet to tablet
                    </Text>
                    <Text style={styles.subtitle}>
                        Use this when the tablet has no internet. You can
                        install an update from a file, or pass an update you
                        already have to another tablet.
                    </Text>
                </>
            ) : null}

            <TouchableOpacity
                style={styles.action}
                onPress={onImport}
                disabled={busy !== null}
                activeOpacity={0.8}
            >
                <View style={styles.iconBox}>
                    <Icon name="file-download" size={20} color="#25684A" />
                </View>
                <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>
                        Install update from a file
                    </Text>
                    <Text style={styles.actionHint}>
                        Choose an update someone sent you or copied onto this
                        tablet.
                    </Text>
                </View>
                {busy === "import" ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={styles.chevron}>{">"}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.action, !canShare && styles.actionDisabled]}
                onPress={onShare}
                disabled={busy !== null || !canShare}
                activeOpacity={0.8}
            >
                <View style={styles.iconBox}>
                    <Icon name="share" size={20} color="#25684A" />
                </View>
                <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>
                        Send update to another tablet
                    </Text>
                    <Text style={styles.actionHint}>
                        {canShare
                            ? "Send by Bluetooth, Nearby Share, WhatsApp or copy to a USB stick."
                            : "Available once this tablet has downloaded or received an update."}
                    </Text>
                </View>
                {busy === "share" ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={styles.chevron}>{">"}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    subtitle: {
        fontSize: 13,
        color: "#475569",
        marginTop: 4,
        marginBottom: 12,
        lineHeight: 19,
    },
    action: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: "#F1F5F9",
        borderRadius: 10,
        marginTop: 10,
    },
    actionDisabled: { opacity: 0.5 },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#DDEFE5",
        alignItems: "center",
        justifyContent: "center",
    },
    actionText: { flex: 1 },
    actionTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
    actionHint: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 17,
    },
    chevron: { fontSize: 20, color: "#94A3B8" },
});
