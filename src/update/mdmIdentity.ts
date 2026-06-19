import { NativeModules, Platform } from 'react-native';

type NativeHeadwindIdentity = {
    provider?: string | null;
    available?: boolean | null;
    managed?: boolean | null;
    kiosk?: boolean | null;
    deviceId?: string | null;
    deviceNumber?: string | null;
    headwindNumber?: string | null;
    oldDeviceNumber?: string | null;
    serverUrl?: string | null;
    custom1?: string | null;
    custom2?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
};

export type MdmIdentity = {
    provider: 'headwind';
    available: boolean;
    managed: boolean | null;
    kiosk: boolean | null;
    deviceId: string | null;
    deviceNumber: string | null;
    headwindNumber: string | null;
    oldDeviceNumber: string | null;
    serverUrl: string | null;
    custom1: string | null;
    custom2: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
};

type MdmIdentityInput = {
    deviceId: string;
    deviceHash?: string | null;
};

const nativeModule = () => (NativeModules as Record<string, any>)?.HeadwindMdmIdentity || null;

function clean(value: unknown) {
    const text = `${value || ''}`.trim();
    return text || null;
}

function booleanOrNull(value: unknown) {
    return typeof value === 'boolean' ? value : null;
}

function normalize(raw?: NativeHeadwindIdentity | null): MdmIdentity {
    return {
        provider: 'headwind',
        available: raw?.available === true,
        managed: booleanOrNull(raw?.managed),
        kiosk: booleanOrNull(raw?.kiosk),
        deviceId: clean(raw?.deviceId),
        deviceNumber: clean(raw?.deviceNumber || raw?.headwindNumber),
        headwindNumber: clean(raw?.headwindNumber || raw?.deviceNumber),
        oldDeviceNumber: clean(raw?.oldDeviceNumber),
        serverUrl: clean(raw?.serverUrl),
        custom1: clean(raw?.custom1),
        custom2: clean(raw?.custom2),
        errorCode: clean(raw?.errorCode),
        errorMessage: clean(raw?.errorMessage),
    };
}

export async function getMdmIdentity(input: MdmIdentityInput): Promise<MdmIdentity | null> {
    if (Platform.OS !== 'android') return null;

    const module = nativeModule();
    if (!module?.getIdentity) {
        return normalize({
            available: false,
            errorCode: 'HEADWIND_NATIVE_MODULE_UNAVAILABLE',
            errorMessage: 'Headwind MDM native identity module is not available in this build',
        });
    }

    try {
        const identity = await module.getIdentity({
            neotreeDeviceId: input.deviceId,
            neotreeDeviceHash: input.deviceHash || '',
        });
        return normalize(identity);
    } catch (error) {
        return normalize({
            available: false,
            errorCode: 'HEADWIND_IDENTITY_ERROR',
            errorMessage: error instanceof Error ? error.message : 'Unable to read Headwind MDM identity',
        });
    }
}
