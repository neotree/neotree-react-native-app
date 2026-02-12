import React from "react";
import { useTheme, Box } from "../Theme";
import { Br } from "../Br";
import Icon from '@expo/vector-icons/MaterialIcons';
import {
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    Modal,
    FlatList,
    Text,
    View,
    Linking,
    StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reportErrors } from "../../data/api";
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    ERROR_CORRECTION,
    ALIGN,
    PAGE_WIDTH
} from "tp-react-native-bluetooth-printer";
import { Button } from "../Button";
import { ASYNC_STORAGE_KEYS } from "../../constants/async-storage";

type PrintBarCodeProps = {
    session: any;
    isGeneric?: boolean;
    onPrinted?: (uid: string) => void;
};

export function PrintBarCode({ session, isGeneric, onPrinted }: PrintBarCodeProps) {
    const theme = useTheme();

    const [printer, setPrinter] = React.useState<any>(null);
    const [printerConnected, setPrinterConnected] = React.useState(false);
    const [printing, setPrinting] = React.useState(false);
    const [connecting, setConnecting] = React.useState(false);
    const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false);
    const [granted, setGranted] = React.useState(false);

    const [devices, setDevices] = React.useState<any[]>([]);
    const [showSelector, setShowSelector] = React.useState(false);

    const lastPrinterAddressRef = React.useRef<string | null>(null);
    const connectingRef = React.useRef(false);

    const PAGE_WIDTH_SAFE = PAGE_WIDTH || { WIDTH_58: 384 };
    const LABEL_WIDTH = PAGE_WIDTH_SAFE.WIDTH_58;
    const QR_CODE_SIZE = 160;

    const OFFSET_STEP = 6;
    const [printerOffset, setPrinterOffset] = React.useState(0);
    const [showAdjust, setShowAdjust] = React.useState(false);

    /* ---------------- PERMISSIONS ---------------- */
    const requestBluetoothPermissions = async () => {
        if (Platform.OS !== "android") {
            setGranted(true);
            return true;
        }

        try {
            if (Platform.Version >= 31) {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
                const ok = result["android.permission.BLUETOOTH_SCAN"] === "granted" &&
                    result["android.permission.BLUETOOTH_CONNECT"] === "granted" &&
                    result["android.permission.ACCESS_FINE_LOCATION"] === "granted";
                setGranted(ok);
                return ok;
            } else {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                const ok = result === "granted";
                setGranted(ok);
                return ok;
            }
        } catch {
            setGranted(false);
            return false;
        }
    };

    /* ---------------- BLUETOOTH ---------------- */
    const ensureBluetoothEnabled = async () => {
        let enabled = await BluetoothManager.isBluetoothEnabled();
        if (!enabled) {
            await BluetoothManager.enableBluetooth();
            await new Promise(r => setTimeout(r, 600));
        }
        enabled = await BluetoothManager.isBluetoothEnabled();
        setBluetoothEnabled(enabled);
        return enabled;
    };

    const connectByAddress = async (address: string) => {
        try {
            await BluetoothManager.connect(address);
            await new Promise(r => setTimeout(r, 1000)); // wait longer for library discovery
            await BluetoothEscposPrinter.printerInit();
            await new Promise(r => setTimeout(r, 500)); // ensure ready
            
            // Load saved offset for this specific printer
            const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS);
            if (raw) {
                const map = JSON.parse(raw);
                if (map[address] !== undefined) {
                    setPrinterOffset(Number(map[address]));
                } else {
                    setPrinterOffset(0);
                }
            } else {
                setPrinterOffset(0);
            }

            setPrinter({ address });
            setPrinterConnected(true);
            lastPrinterAddressRef.current = address;
            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS, address);
            return true;
        } catch (e) {
            console.log("Printer connection failed", e);
            return false;
        }
    };

    const fastReconnect = async () => {
        if (!lastPrinterAddressRef.current) return false;
        return await connectByAddress(lastPrinterAddressRef.current);
    };

    /* ---------------- SCAN & SELECT ---------------- */
    const scanDevices = async () => {
        try {
            const raw = await BluetoothManager.scanDevices();
            if (!raw) return [];

            const parsed = JSON.parse(String(raw));
            const paired = Array.isArray(parsed?.paired) ? parsed.paired : [];
            const found = Array.isArray(parsed?.found) ? parsed.found : [];
            const map = new Map<string, any>();
            [...paired, ...found].forEach(d => {
                if (d?.address) map.set(d.address, d);
            });
            const all = Array.from(map.values());
            all.sort((a, b) => {
                const aBT = (a.name || "").toUpperCase().startsWith("BT-");
                const bBT = (b.name || "").toUpperCase().startsWith("BT-");
                if (aBT && !bBT) return -1;
                if (!aBT && bBT) return 1;
                return (a.name || "").localeCompare(b.name || "");
            });
            return all;
        } catch (e: any) {
            let message = "Scan failed";
            if (Array.isArray(e) && e[0]?.message) message = e[0].message;
            else if (e?.message) message = e.message;
            
            if (message === "NOT_STARTED") {
                Alert.alert(
                    "Bluetooth Error", 
                    "Could not start scanning. Please ensure Bluetooth and Location Services (GPS) are enabled.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() }
                    ]
                );
            }
            return [];
        }
    };

    const openDeviceSelector = async () => {
        setConnecting(true);
        const scanned = await scanDevices();
        setDevices(scanned);
        setShowSelector(true);
        setConnecting(false);
    };

    const connectToPrinter = async () => {
        if (connectingRef.current) return false;
        connectingRef.current = true;
        setConnecting(true);
        try {
            const ok = granted || await requestBluetoothPermissions();
            if (!ok) return false;

            const enabled = await ensureBluetoothEnabled();
            if (!enabled) return false;

            const fast = await fastReconnect();
            if (fast) return true;

            await openDeviceSelector();
            return false;
        } catch (e) {
            return false;
        } finally {
            connectingRef.current = false;
            setConnecting(false);
        }
    };

    const ensurePrinterConnected = async () => {
        if (printerConnected && printer) return true;
        return await connectToPrinter();
    };

    /* ---------------- PRINT ---------------- */
    const printQrLabel = async (uid: string) => {
        await BluetoothEscposPrinter.printerInit();
        await BluetoothEscposPrinter.setWidth(LABEL_WIDTH);
        
        // Use LEFT alignment with manual centering for maximum compatibility
        // Some printers interpret CENTER differently based on their internal paper width settings
        await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
        
        const centeredOffset = Math.max(0, Math.round((LABEL_WIDTH - QR_CODE_SIZE) / 2));
        const finalOffset = Math.max(0, centeredOffset + printerOffset);
        
        await BluetoothEscposPrinter.printerLeftSpace(finalOffset);
        await BluetoothEscposPrinter.printQRCode(uid, QR_CODE_SIZE, ERROR_CORRECTION.M, 0);
        
        await BluetoothEscposPrinter.printAndFeed(3);
        await BluetoothEscposPrinter.printerInit();
    };

    const print = async () => {
        const uid = session?.uid;
        if (!uid) {
            Alert.alert("Missing QR Data. Please scan or enter a valid ID.");
            return;
        }

        setPrinting(true);
        try {
            const connected = await ensurePrinterConnected();
            if (!connected) return;

            // Ensure printer fully initialized
            await BluetoothEscposPrinter.printerInit();
            await new Promise(r => setTimeout(r, 300));

            await printQrLabel(uid);
            onPrinted?.(uid);

        } catch (e: any) {
            let message = "Failed";
            if (Array.isArray(e) && e[0]?.message) message = e[0].message;
            else if (e?.message) message = e.message;

            Alert.alert("Printing Error", message);
            reportErrors(e);
        } finally {
            setPrinting(false);
        }
    };

    /* ---------------- INIT ---------------- */
    React.useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS);
            if (saved) {
                lastPrinterAddressRef.current = saved;
                // Also load the offset for the last printer
                const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS);
                if (raw) {
                    const map = JSON.parse(raw);
                    if (map[saved] !== undefined) {
                        setPrinterOffset(Number(map[saved]));
                    }
                }
            }
        })();
    }, []);

    /* ---------------- UI ---------------- */
    return (
        <>
            {isGeneric ? (
                <Button
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={printerConnected ? { backgroundColor: theme.colors.primary } :
                        (bluetoothEnabled ? { backgroundColor: "blue" } : { backgroundColor: theme.colors.error })}
                    disabled={printing || !session || connecting}
                    onPress={print}
                >
                    {printing || connecting ? <ActivityIndicator size={24} color={theme.colors.primary} /> :
                        (printerConnected ? "Print QR Code" : "Connect Printer")}
                </Button>
            ) : (
                <TouchableOpacity
                    onPress={print}
                    disabled={printing || !session || connecting}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={{ alignItems: 'flex-start', justifyContent: 'center', minWidth: 40, minHeight: 40 }}
                >
                    {!printing && !connecting ? (
                        printerConnected ? <Icon color={theme.colors.primary} size={40} name="qr-code" /> :
                            (bluetoothEnabled ? <Icon color="blue" size={40} name="qr-code" /> :
                                <Icon color={theme.colors.error} size={40} name="qr-code" />)
                    ) : (
                        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator color={theme.colors.primary} size="small" />
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {/* Device Selection Modal */}
            <Modal visible={showSelector} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Printer</Text>
                        {connecting && <ActivityIndicator size="large" color={theme.colors.primary} />}
                        {!connecting && devices.length === 0 && <Text style={styles.noDevicesText}>No devices found</Text>}
                        <FlatList
                            data={devices}
                            keyExtractor={item => item.address}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.deviceItem}
                                    onPress={async () => {
                                        const ok = await connectByAddress(item.address);
                                        if (!ok) Alert.alert("Connection failed");
                                        else setShowSelector(false);
                                    }}
                                >
                                    <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
                                    <Text style={styles.deviceAddress}>{item.address}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Br spacing="m" />
                        <Button onPress={() => setShowSelector(false)}>Close</Button>
                    </View>
                </View>
            </Modal>

            {printerConnected && (
                <>
                    <Br spacing="s" />
                    <Button variant="link" onPress={() => setShowAdjust(v => !v)}>
                        {showAdjust ? 'Hide Alignment' : 'Adjust Alignment'}
                    </Button>
                    {showAdjust && (
                        <>
                            <Br spacing="s" />
                            <Box flexDirection="row" alignItems="center">
                                <Button color="secondary" onPress={() => setPrinterOffset(v => v - OFFSET_STEP)}>Shift Left</Button>
                                <Box margin="s" />
                                <Button color="secondary" onPress={() => setPrinterOffset(v => v + OFFSET_STEP)}>Shift Right</Button>
                                <Box margin="s" />
                                <Button color="primary" onPress={async () => {
                                    if (!printer?.address) return;
                                    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS);
                                    const map = raw ? JSON.parse(raw) : {};
                                    map[printer.address] = printerOffset;
                                    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS, JSON.stringify(map));
                                    setShowAdjust(false);
                                }}>Save</Button>
                            </Box>
                            <Br spacing="s" />
                        </>
                    )}
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '90%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    deviceItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333'
    },
    deviceAddress: {
        fontSize: 13,
        color: '#666',
        marginTop: 2
    },
    noDevicesText: {
        textAlign: 'center',
        color: '#999',
        marginVertical: 20
    }
});
