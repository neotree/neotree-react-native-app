import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
    initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
    return useReducer(
        (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
        initialValue
    ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
    if (Platform.OS === 'web') {
        try {
            if (value === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error('Local storage is unavailable:', e);
        }
    } else {
        if (value == null) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    }
}

export async function getStorageItemAsync(key: string) {
	let value: string | null = null;

    if (Platform.OS === 'web') {
		try {
			if (typeof localStorage !== 'undefined') {
				value = localStorage.getItem(key);
			}
		} catch (e) {
			console.error('Local storage is unavailable:', e);
		}
	} else {
		value = await SecureStore.getItemAsync(key);
	}

	return value;
}

/**
 * Retrieves async storage item
 *
 * @param key `required` Async storage item key
 * @param options `optional`
 * @param options.initialValue `optional` If item is not set, `initialValue` will be set
 * @returns
 */
export function useStorageState(
	key: string,
	options?: {
		/**
		 * If item is not set, `initialValue` will be set
		 * */
		initialValue?: string | (() => Promise<string>);
	}
): UseStateHook<string> {
    // Public
    const [[loading, value], setState] = useAsyncState<string>();

    // Get
    useEffect(() => {
        (async () => {
			let value = await getStorageItemAsync(key);

			if (!value && options?.initialValue) {
				value = typeof options.initialValue === 'string' ? options.initialValue : await options.initialValue();
				await setStorageItemAsync(key, value);
			}

			setState(value);
		})();
    }, [key, options?.initialValue]);

    // Set
    const setValue = useCallback(
        (value: string | null) => {
            setState(value);
            setStorageItemAsync(key, value);
        },
        [key]
    );

    return [
		[
			loading,
			value,
		],
		setValue,
	];
}
