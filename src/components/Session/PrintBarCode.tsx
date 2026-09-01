import React from "react";
import { useTheme, Box} from "../Theme";
import Icon from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Alert, TouchableOpacity, PermissionsAndroid, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reportErrors } from "../../data/api"
import RNQRGenerator from 'rn-qr-generator';
import * as FileSystem from 'expo-file-system';
import { Skia, ImageFormat } from "@shopify/react-native-skia";
import {
    BluetoothManager,
    BluetoothEscposPrinter,
    PAGE_WIDTH
} from "tp-react-native-bluetooth-printer";
import { Button } from "../Button";
import { ASYNC_STORAGE_KEYS } from "../../constants/async-storage";
import { getSessionPrintBlockMessage, isSessionPrintable } from "./printEligibility";
import { PrintBlockedDialog } from "./PrintBlockedDialog";

type PrintBarCodeProps = {
    session: any;
    isGeneric?: boolean;
    onPrinted?: (uid: string) => void;
};
export function PrintBarCode({ session, isGeneric, onPrinted }: PrintBarCodeProps) {
    const theme = useTheme();
    const printable = isGeneric || isSessionPrintable(session);
    const [showBlockedDialog, setShowBlockedDialog] = React.useState(false);

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

        // Check if any newly found device is available (not the last address)
        const newlyFoundDevices = devices.filter((entry) =>
            entry.source === 'found' && (!lastAddress || entry.device.address !== lastAddress)
        );

        if (newlyFoundDevices.length > 0) {
            // If there are newly found devices, pick the first one (or connected one if available)
            const connectedNew = newlyFoundDevices.find((entry) =>
                connectedAddresses.has(entry.device.address)
            );
            if (connectedNew) return connectedNew.device;
            return newlyFoundDevices[0].device;
        }

        // If no new devices, check if last device is still available and connected
        if (lastAddress) {
            const lastDevice = devices.find((entry) => entry.device.address === lastAddress);
            if (lastDevice && connectedAddresses.has(lastAddress)) {
                return lastDevice.device;
            }
        }

        // Otherwise, pick any available device (prioritize connected > found > paired)
        const scored = devices.map((entry) => {
            let score = 0;
            if (connectedAddresses.has(entry.device.address)) score += 1000;
            if (entry.source === 'found') score += 50;
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
            }

            const enabled = await ensureBluetoothEnabled();
            if (!enabled) {
                if (!onStart) {
                    showPrintingError("BLUE TOOTH NOT ENABLED. PUT BLUETOOTH ON AND PRESS RETRY")
                    setConnecting(false)
                }
                return false;
            }

            if (!onStart) {
                setConnecting(true)
            }

            const tryConnect = async () => {
                // Always do a fresh scan to detect newly powered devices
                const scannedDevices = await BluetoothManager.scanDevices();

                if (!scannedDevices) {
                    // If scan fails, check connected devices as fallback
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
                    return false;
                }

                const scanned = JSON.parse(String(scannedDevices))
                const paired = Array.isArray(scanned?.paired) ? scanned.paired : [];
                const found = Array.isArray(scanned?.found) ? scanned.found : [];
   
                // Combine paired and found devices
                const devices = [
                    ...paired.map((device: any) => ({ device, source: 'paired' as const })),
                    ...found.map((device: any) => ({ device, source: 'found' as const })),
                ];
  

                // Filter for target printer
                const targetDevices = devices.filter((entry) => isTargetPrinter(entry.device));
      

                if (!targetDevices.length) return false;

                // Get currently connected devices for scoring
                const connectedDevices = await BluetoothManager.getConnectedDevice()
   

                // Select the best device (prioritizes newly found devices)
                const bestDevice = selectBestPrinter(targetDevices, connectedDevices, lastPrinterAddressRef.current);
        

                if (!bestDevice) return false;

                // Attempt to connect to the best device
                let connectionSuccessful = false;
                try {
                    await BluetoothManager.connect(bestDevice.address)
  
                    connectionSuccessful = true;
                } catch (connectError: any) {


                    // If connection failed and it's a paired device, try to unpair and re-pair it
                    const isPaired = paired.some((d: any) => d.address === bestDevice.address);
                    if (isPaired) {
                              try {
                            await BluetoothManager.unpair(bestDevice.address);
        

                            // Small delay to ensure unpair completes
                            await new Promise(resolve => setTimeout(resolve, 500));

                            // Try to reconnect after unpair
                            await BluetoothManager.connect(bestDevice.address)

                            connectionSuccessful = true;
                        } catch (unpairError) {
              
                            // Even if unpair fails, continue - device may still work
                            connectionSuccessful = true;
                        }
                    } else {
                        // Device is not paired, it's newly found - continue anyway
                        connectionSuccessful = true;
                    }
                }

                if (connectionSuccessful) {
                    setPrinter(bestDevice)
                    setPrinterConnected(true)
                    lastPrinterAddressRef.current = bestDevice.address;
                    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRINTER_LAST_ADDRESS, bestDevice.address);
                    setConnecting(false)
                    return true;
                }

                return false;
            };

            const connected = await tryConnect();
            if (connected) return true;

            // Fallback: clear last printer and retry (handles case where previously used device is now unavailable)

            await clearLastPrinter();
            const retried = await tryConnect();
            if (retried) return true;

            // If still no connection, clear last printer to force fresh scan next time
            await clearLastPrinter();

            if (!onStart) {
                retryPrinterConnection("LABELS PRINTER WAS NOT FOUND. PLEASE TURN ON THE PRINTER AND PAIR IT TO THIS DEVICE.")
                setConnecting(false)
            }
            return false;

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

    const generateQRCodeBase64 = async (uid: string): Promise<string | null> => {
        let filePath: string | null = null;
        try {
            const response = await RNQRGenerator.generate({
                value: uid,
                width: 120,
                height: 120,
                backgroundColor: '#ffffff',
                color: '#000000',
                correctionLevel: 'H',
            });

            // RNQRGenerator returns a file path
            if (response?.uri) {
                filePath = response.uri;
                try {
                    const base64 = await FileSystem.readAsStringAsync(response.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    return base64;
                } catch {
                    return null;
                }
            }

            return null;
        } catch (e) {
         
            return null;
        } finally {
            // Clean up temp QR file
            if (filePath) {
                try {
                    await FileSystem.deleteAsync(filePath, { idempotent: true });
                } catch {
                    // ignore temp file cleanup failures
                }
            }
        }
    };

    const combineQRCodesIntoBase64 = (leftBase64: string, rightBase64: string, qrSize: number, spacing: number): string | null => {
        try {
            const combinedWidth = qrSize + spacing + qrSize;
            const combinedHeight = qrSize;

            // Decode both base64 images
            const data1 = Skia.Data.fromBase64(leftBase64);
            const data2 = Skia.Data.fromBase64(rightBase64);

            const image1 = Skia.Image.MakeImageFromEncoded(data1);
            const image2 = Skia.Image.MakeImageFromEncoded(data2);

            if (!image1 || !image2) return null;

            // Create offscreen surface for combined image
            const surface = Skia.Surface.MakeOffscreen(combinedWidth, combinedHeight);
            if (!surface) return null;

            const canvas = surface.getCanvas();

            // Fill background with white
            const bgPaint = Skia.Paint();
            bgPaint.setColor(Skia.Color('white'));
            canvas.drawRect(Skia.XYWHRect(0, 0, combinedWidth, combinedHeight), bgPaint);

            const paint = Skia.Paint();

            // Draw left QR code
            canvas.drawImageRect(
                image1,
                Skia.XYWHRect(0, 0, image1.width(), image1.height()),
                Skia.XYWHRect(0, 0, qrSize, qrSize),
                paint
            );

            // Draw right QR code
            canvas.drawImageRect(
                image2,
                Skia.XYWHRect(0, 0, image2.width(), image2.height()),
                Skia.XYWHRect(qrSize + spacing, 0, qrSize, qrSize),
                paint
            );

            surface.flush();
            const snapshot = surface.makeImageSnapshot();
            const combinedBase64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

            return combinedBase64;
        } catch {
            return null;
        }
    };

    const printQrLabel = async (uid: string) => {
        const leftBase64 = await generateQRCodeBase64(uid);
        const rightBase64 = await generateQRCodeBase64(uid);

        if (!leftBase64 || !rightBase64) {
            throw new Error("Failed to generate QR codes");
        }

        try {
            const qrSize = 120;
            const spacing = 80; // Spacing to ensure clear separation

            // Combine both QR codes into a single image
            const combinedBase64 = combineQRCodesIntoBase64(leftBase64, rightBase64, qrSize, spacing);
            if (!combinedBase64) {
                throw new Error("Failed to combine QR codes");
            }

            const combinedWidth = qrSize + spacing + qrSize;
            const leftPadding = Math.max(0, Math.round((LABEL_WIDTH - combinedWidth) / 2) + printerOffset);

            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.setWidth(LABEL_WIDTH);
            await BluetoothEscposPrinter.printerLineSpace(0);
            await BluetoothEscposPrinter.printAndFeed(QR_TOP_FEED_LINES);

            // Print combined QR codes as single image
            await BluetoothEscposPrinter.printPic(combinedBase64, {
                width: combinedWidth,
                height: qrSize,
                left: leftPadding
            });

            await BluetoothEscposPrinter.printAndFeed(QR_BOTTOM_FEED_LINES);
            await BluetoothEscposPrinter.printerInit();
        } catch (e: any) {
            throw new Error(e.message || "Failed to print QR codes");
        }
    };

    const print = async () => {
        if (!printable) {
            setShowBlockedDialog(true);
            return;
        }

        setPrinting(true)
        const uid = session?.uid || session?.['uid'];
        if (!uid) {
            setPrinting(false);
            showPrintingError("MISSING QR DATA. PLEASE SCAN OR ENTER A VALID ID.")
            return;
        }
        if (!printer || !printerConnected) {
            const connected = await ensurePrinterConnected();
            if (!connected) {
                setPrinting(false);
                return;
            }
        }

        let hadError = false;
        let errorMessage = "";
        try {
            await printQrLabel(uid);
            onPrinted?.(uid);
        } catch (e: any) {
            hadError = true;
            errorMessage = e.message;
            reportErrors(e)
        } finally {
            setPrinting(false)
        }

        // Show error after printing state is reset to avoid layout shifts
        if (hadError) {
            showPrintingError(errorMessage)
        }
    }
    return (
        <Box style={{ maxHeight: 45, overflow: 'hidden' }}>
            <PrintBlockedDialog
                open={showBlockedDialog}
                message={getSessionPrintBlockMessage(session)}
                onClose={() => setShowBlockedDialog(false)}
            />
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
                    {!printing && !connecting ? (printerConnected ? <Icon color={printable ? theme.colors.primary : theme.colors.textDisabled} size={40} name="qr-code" />
                        : (bluetoothEnabled ? <Icon color={printable ? "blue" : theme.colors.textDisabled} size={40} name="qr-code" />
                            : <Icon color={printable ? theme.colors.error : theme.colors.textDisabled} size={40} name="qr-code" />))
                        : (
                            <ActivityIndicator
                                color={theme.colors.primary}
                                size={theme.textVariants.title1.fontSize}
                            />
                        )}
                </TouchableOpacity>
            }
            {printerConnected && showAdjust ? (
                <Box style={{ position: 'absolute', top: 50, right: 0, backgroundColor: 'white', padding: 8, borderRadius: 4, zIndex: 1000 }}>
                    <Button
                        variant="link"
                        onPress={() => setShowAdjust(false)}
                        style={{ marginBottom: 4 }}
                    >
                        Hide Alignment
                    </Button>
                    <Box flexDirection="row" alignItems="center" style={{ marginBottom: 4 }}>
                        <Button
                            color="secondary"
                            onPress={() => setPrinterOffset(v => v - OFFSET_STEP)}
                        >
                            Move Left
                        </Button>
                        <Box margin="s" />
                        <Button
                            color="secondary"
                            onPress={() => setPrinterOffset(v => v + OFFSET_STEP)}
                        >
                            Move Right
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
                </Box>
            ) : printerConnected ? (
                <Button
                    variant="link"
                    onPress={() => setShowAdjust(true)}
                    style={{ marginTop: 4 }}
                >
                    Adjust Alignment
                </Button>
            ) : null}
        </Box>
    );


}
