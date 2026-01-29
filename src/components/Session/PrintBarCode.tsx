import React from "react";
import { useTheme } from "../Theme";
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
    const lastPrinterAddressRef = React.useRef<string | null>(null);
    const connectingRef = React.useRef(false);

    const LABEL_WIDTH = PAGE_WIDTH.WIDTH_58;
    const QR_CODE_SIZE = 160; // keep margins on 2" x 1" label
    const QR_TOP_FEED_LINES = 1;
    const QR_BOTTOM_FEED_LINES = 2;
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
                        onPress: () => connectBlueTooth(true),
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
            if (entry.source === 'paired') score += 10;
            return { ...entry, score };
        });
        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
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
                    const connectedDevices = await BluetoothManager.getConnectedDevice()
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
                    if (!scannedDevices) {
                        if (!onStart) {
                            showPrintingError("NO CONNECTED PRINTERS FOUND.")
                        }

                        return false;
                    } else {
                        const scanned = JSON.parse(String(scannedDevices))
                        const paired = Array.isArray(scanned?.paired) ? scanned.paired : [];
                        const found = Array.isArray(scanned?.found) ? scanned.found : [];
                        const devices = [
                            ...paired.map((device: any) => ({ device, source: 'paired' as const })),
                            ...found.map((device: any) => ({ device, source: 'found' as const })),
                        ];
                        const targetDevices = devices.filter((entry) => isTargetPrinter(entry.device));
                        if (!targetDevices.length) {
                            if (!onStart) {
                                retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                                setConnecting(false)
                            }

                            return false;
                        } else {
                            const bestDevice = selectBestPrinter(targetDevices, connectedDevices, lastPrinterAddressRef.current);
                            if (!bestDevice) {
                                retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                                setConnecting(false)
                                return false;
                            }
                            await BluetoothManager.connect(bestDevice.address)
                            setPrinter(bestDevice)
                            setPrinterConnected(true)
                            lastPrinterAddressRef.current = bestDevice.address;
                            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS, bestDevice.address);
                            setConnecting(false)
                            return true;
                        }
                    }

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
        const leftPadding = Math.max(0, Math.floor((LABEL_WIDTH - QR_CODE_SIZE) / 2));
        await BluetoothEscposPrinter.printerInit();
        await BluetoothEscposPrinter.setWidth(LABEL_WIDTH);
        await BluetoothEscposPrinter.printerLeftSpace(0);
        await BluetoothEscposPrinter.printerLineSpace(0);
        await BluetoothEscposPrinter.printerAlign(ALIGN.CENTER);
        await BluetoothEscposPrinter.printAndFeed(QR_TOP_FEED_LINES);
        await BluetoothEscposPrinter.printQRCode(uid, QR_CODE_SIZE, ERROR_CORRECTION.M, leftPadding);
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

        </>
    );


}
