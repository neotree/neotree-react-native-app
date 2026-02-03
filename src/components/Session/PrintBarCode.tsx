import React from "react";
import { useTheme, Box } from "../Theme";
import Br from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Alert, TouchableOpacity, PermissionsAndroid, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reportErrors } from "../../data/api"
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
    const [printing, setPrinting] = React.useState(false)
    const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false)
    const [connecting, setConnecting] = React.useState(false)
    const [printerConnected, setPrinterConnected] = React.useState(false)
    const [granted, setGranted] = React.useState(false)
    const [printerOffset, setPrinterOffset] = React.useState(0);
    const [showAdjust, setShowAdjust] = React.useState(false);
    const lastPrinterAddressRef = React.useRef<string | null>(null);
    const connectingRef = React.useRef(false);

    const PAGE_WIDTH_SAFE = PAGE_WIDTH || { WIDTH_58: 384, WIDTH_80: 576 };
    const LABEL_WIDTH = PAGE_WIDTH_SAFE.WIDTH_58;
    const QR_CODE_SIZE = 160;
    const QR_TOP_FEED_LINES = 2;
    const QR_BOTTOM_FEED_LINES = 2;
    const OFFSET_STEP = 6;
    // TO MAKE CONFIGURABLE ONCE WE HAVE DIFFERENT PRINTERS
    const PRINTER_NAME_HINTS = ["BT-58L"];



    const showPrintingError = (error: any) => {

        {
            Alert.alert(
                'Printer Not Connected:',
                error,
                [
                    {
                        text: 'CANCEL',
                    },
                    {
                        text: 'RETRY?',
                        onPress: () => connectToPrinter(false),
                    }
                ]
            );
        }

    }

    const retryPrinterConnection = (error: any) => {

        {
            Alert.alert(
                'Printer Not Connected:',
                error,
                [
                    {
                        text: 'CANCEL',
                    },
                    {
                        text: 'RETRY?',
                        onPress: () => connectToPrinter(false),
                    }
                ]
            );
        }

    }

    const requestBlueToothPermissions = async () => {

        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            if (result && result["android.permission.ACCESS_FINE_LOCATION"] === 'granted') {
                setGranted(true)
            } else {

            }

        }
    }

    const isTargetPrinter = React.useCallback((device: any) => {
        const name = (device?.name || '').toUpperCase();
        return PRINTER_NAME_HINTS.some((hint) => name.includes(hint));
    }, []);

    const selectBestPrinter = React.useCallback((
        devices: { device: any; source: 'paired' | 'found' }[],
        connected: any[],
        lastAddress: string | null
    ) => {
        if (!devices.length) return null;
        const connectedAddresses = new Set((connected || []).map((d: any) => d.address));
        const scored = devices.map((entry) => {
            let score = 0;
            if (connectedAddresses.has(entry.device.address)) score += 1000;
            if (lastAddress && entry.device.address === lastAddress) score += 200;
            if (isTargetPrinter(entry.device)) score += 100;
            if (entry.source === 'found') score += 50;
            if (entry.source === 'paired') score += 10;
            return { ...entry, score };
        });
        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.source !== b.source) {
                if (a.source === 'found') return -1;
                if (b.source === 'found') return 1;
            }
            return String(a.device.address).localeCompare(String(b.device.address));
        });
        return scored[0]?.device || null;
    }, [isTargetPrinter]);

    const ensureBluetoothEnabled = async () => {
        const enabled = await BluetoothManager.isBluetoothEnabled();
        if (!enabled) {
            await BluetoothManager.enableBluetooth();
        }
        const checked = await BluetoothManager.isBluetoothEnabled();
        setBluetoothEnabled(checked);
        return checked;
    };

    const clearLastPrinter = async () => {
        lastPrinterAddressRef.current = null;
        try {
            await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS);
        } catch {
            // ignore storage errors
        }
    };

    const connectToPrinter = async (onStart: boolean) => {
        try {
            if (!granted) {
                await requestBlueToothPermissions()
                return false;
            } else {
                const enabled = await ensureBluetoothEnabled();
                if (!enabled) {
                    if (!onStart) {
                        showPrintingError("BLUE TOOTH NOT ENABLED. PUT BLUETOOTH ON AND PRESS RETRY")
                        setConnecting(false)
                    }
                    return false;
                }
                if (enabled) {
                    if (!onStart) {
                        setConnecting(true)
                    }
                    const tryConnect = async () => {
                        const connectedDevices = await BluetoothManager.getConnectedDevice()
                        console.log('[BT][connected]', connectedDevices);
                        const connectedTarget = (connectedDevices || []).find((device: any) => isTargetPrinter(device));
                        if (connectedTarget) {
                            setPrinter(connectedTarget)
                            setPrinterConnected(true)
                            lastPrinterAddressRef.current = connectedTarget.address;
                            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS, connectedTarget.address);
                            setConnecting(false)
                            return true;
                        }
                        const scannedDevices = await BluetoothManager.scanDevices();
                        console.log('[BT][scanDevices raw]', scannedDevices);
                        if (!scannedDevices) {
                            return false;
                        }
                        const scanned = JSON.parse(String(scannedDevices))
                        console.log('[BT][scanDevices parsed]', scanned);
                        const paired = Array.isArray(scanned?.paired) ? scanned.paired : [];
                        const found = Array.isArray(scanned?.found) ? scanned.found : [];
                        console.log('[BT][paired]', paired);
                        console.log('[BT][found]', found);
                        const devices = [
                            ...paired.map((device: any) => ({ device, source: 'paired' as const })),
                            ...found.map((device: any) => ({ device, source: 'found' as const })),
                        ];
                        console.log('[BT][devices]', devices);
                        const targetDevices = devices.filter((entry) => isTargetPrinter(entry.device));
                        console.log('[BT][targetDevices]', targetDevices);
                        if (!targetDevices.length) return false;
                        const foundTargets = targetDevices.filter((entry) => entry.source === 'found');
                        const candidates = foundTargets.length ? foundTargets : targetDevices;
                        const bestDevice = selectBestPrinter(candidates, connectedDevices, lastPrinterAddressRef.current);
                        console.log('[BT][bestDevice]', bestDevice);
                        if (!bestDevice) return false;
                        await BluetoothManager.connect(bestDevice.address)
                        setPrinter(bestDevice)
                        setPrinterConnected(true)
                        lastPrinterAddressRef.current = bestDevice.address;
                        await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS, bestDevice.address);
                        setConnecting(false)
                        return true;
                    };

                    const connected = await tryConnect();
                    if (connected) return true;

                    // fallback: forget last device and retry once
                    await clearLastPrinter();
                    const retried = await tryConnect();
                    if (retried) return true;

                    if (!onStart) {
                        retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                        setConnecting(false)
                    }
                    return false;

                } else {
                    if (!onStart) {
                        showPrintingError("BLUE TOOTH NOT ENABLED. PUT BLUETOOTH ON AND PRESS RETRY")
                        setConnecting(false)
                    }
                    return false;
                }
            }

        } catch (e: any) {
            if (!onStart) {
                showPrintingError(e.message)
                setConnecting(false)
            }
            return false;
        }
    }

    const connectBlueTooth = async (onStart: boolean) => {
        try{
        if (granted) {
            if (onStart) {
                setConnecting(true)
            }
            const isBlueToothEnabled = await BluetoothManager.isBluetoothEnabled()
            if (!isBlueToothEnabled) {
                await BluetoothManager.enableBluetooth()
            }
            setBluetoothEnabled(await BluetoothManager.isBluetoothEnabled())
            if (onStart) {
                await connectToPrinter(false);
            }
        } else {
            await requestBlueToothPermissions()
        }
    }catch(e){

    }finally{
        setConnecting(false)
    }
    }

    React.useEffect(() => {

        if (granted) {
            const connectBT = async () => await connectBlueTooth(false)
            connectBT()
        } else {
            const requestPermissions = async () => {
                await requestBlueToothPermissions()
            }
            requestPermissions()
        }
    }, [granted]);

    React.useEffect(() => {
        const loadLastPrinter = async () => {
            try {
                const savedAddress = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS);
                if (savedAddress) {
                    lastPrinterAddressRef.current = savedAddress;
                }
            } catch (e) {
                // ignore storage load errors
            }
        };
        loadLastPrinter();
    }, []);

    React.useEffect(() => {
        const syncConnectedPrinter = async () => {
            try {
                const enabled = await BluetoothManager.isBluetoothEnabled();
                setBluetoothEnabled(enabled);
                if (!enabled) return;
                const connectedDevices = await BluetoothManager.getConnectedDevice();
                const connectedTarget = (connectedDevices || []).find((device: any) => isTargetPrinter(device))
                    || (connectedDevices || []).find((device: any) => device.address === lastPrinterAddressRef.current);
                if (connectedTarget) {
                    setPrinter(connectedTarget);
                    setPrinterConnected(true);
                }
            } catch (e) {
                // ignore sync errors
            }
        };
        syncConnectedPrinter();
    }, [granted, isTargetPrinter]);

    React.useEffect(() => {
        const loadOffset = async () => {
            if (!printer?.address) return;
            try {
                const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS);
                const map = raw ? JSON.parse(raw) : {};
                const saved = typeof map[printer.address] === 'number' ? map[printer.address] : 0;
                setPrinterOffset(saved);
            } catch {
                setPrinterOffset(0);
            }
        };
        loadOffset();
    }, [printer?.address]);

    const ensurePrinterConnected = async () => {
        if (printerConnected && printer) return true;
        if (connectingRef.current) return false;
        connectingRef.current = true;
        try {
            const connected = await connectToPrinter(false);
            return connected || (printerConnected && !!printer);
        } finally {
            connectingRef.current = false;
        }
    };

    const printQrLabel = async (uid: string) => {
        const basePadding = Math.max(0, Math.round((LABEL_WIDTH - QR_CODE_SIZE) / 2));
        const leftSpace = Math.max(0, basePadding + printerOffset);
        await BluetoothEscposPrinter.printerInit();
        await BluetoothEscposPrinter.setWidth(LABEL_WIDTH);
        await BluetoothEscposPrinter.printerLeftSpace(leftSpace);
        await BluetoothEscposPrinter.printerLineSpace(0);
        await BluetoothEscposPrinter.printerAlign(ALIGN.LEFT);
        await BluetoothEscposPrinter.printAndFeed(QR_TOP_FEED_LINES);
        await BluetoothEscposPrinter.printQRCode(uid, QR_CODE_SIZE, ERROR_CORRECTION.M, 0);
        await BluetoothEscposPrinter.printAndFeed(QR_BOTTOM_FEED_LINES);
        await BluetoothEscposPrinter.printerInit();
    };

    const print = async () => {
        setPrinting(true)
        const uid = session?.uid || session?.['uid'];
        if (!uid) {
            showPrintingError("MISSING QR DATA. PLEASE SCAN OR ENTER A VALID ID.")
            setPrinting(false);
            return;
        }
        if (!printer || !printerConnected) {
            const connected = await ensurePrinterConnected();
            if (!connected) {
                setPrinting(false);
                return;
            }
        }
        try {
            await printQrLabel(uid);
            onPrinted?.(uid);
        } catch (e: any) {
            showPrintingError(e.message)
            reportErrors(e)

        } finally {
            setPrinting(false)

        }
    }
    return (
        <>
            {isGeneric ?
                <Button
                    hitSlop={{ bottom: 20, left: 20, right: 20 }}
                    style={printerConnected ? { alignItems: 'center', backgroundColor: theme.colors.primary } :
                        (bluetoothEnabled ? { alignItems: 'center', width: 'auto', backgroundColor: "blue" }
                            : { alignItems: 'center', width: 'auto', backgroundColor: theme.colors.error })}
                    disabled={printing || !session || connecting}
                    onPress={print}
                >
                    {printing || connecting ? <ActivityIndicator size={24} color={theme.colors.primary} /> : (printerConnected ? 'Print QR Code' :
                        'Connect Printer')}
                </Button>
                : <TouchableOpacity
                    onPress={print}
                    disabled={printing || !session}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={{ alignItems: 'flex-start' }}
                >
                    {!printing && !connecting ? (printerConnected ? <Icon color={theme.colors.primary} size={40} name="qr-code" />
                        : (bluetoothEnabled ? <Icon color={"blue"} size={40} name="qr-code" />
                            : <Icon color={theme.colors.error} size={40} name="qr-code" />))
                        : (
                            <ActivityIndicator
                                color={theme.colors.primary}
                                size={theme.textVariants.title1.fontSize}
                            />
                        )}
                </TouchableOpacity>
            }
            {printerConnected ? (
                <>
                    <Br spacing="s" />
                    <Button
                        variant="link"
                        onPress={() => setShowAdjust(v => !v)}
                    >
                        {showAdjust ? 'Hide Alignment' : 'Adjust Alignment'}
                    </Button>
                    {showAdjust ? (
                        <>
                            <Br spacing="s" />
                            <Box flexDirection="row" alignItems="center">
                                <Button
                                    color="secondary"
                                    onPress={() => setPrinterOffset(v => v - OFFSET_STEP)}
                                >
                                    Shift Left
                                </Button>
                                <Box margin="s" />
                                <Button
                                    color="secondary"
                                    onPress={() => setPrinterOffset(v => v + OFFSET_STEP)}
                                >
                                    Shift Right
                                </Button>
                                <Box margin="s" />
                                <Button
                                    color="primary"
                                    onPress={async () => {
                                        if (!printer?.address) return;
                                        try {
                                            const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS);
                                            const map = raw ? JSON.parse(raw) : {};
                                            map[printer.address] = printerOffset;
                                            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_QR_OFFSETS, JSON.stringify(map));
                                            setShowAdjust(false);
                                        } catch {
                                            // ignore storage errors
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            </Box>
                            <Br spacing="s" />
                        </>
                    ) : null}
                </>
            ) : null}
        </>
    );


}
