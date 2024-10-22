import { create } from "zustand";

import { getConfiguration } from '@/data/queries/configuration';
import { saveConfiguration } from '@/data/mutations/configuration';

type ConfigurationState = {
    configurationSaving: boolean;
    configurationSaveErrors: string[];
    configurationLoading: boolean;
    configurationInitialised: boolean;
    configurationErrors: string[];
    configuration: Awaited<ReturnType<typeof getConfiguration>>['data'];
};

type ConfigurationStore = ConfigurationState & {
    getConfiguration: () => Promise<void>;
    saveConfiguration: (data: Parameters<typeof saveConfiguration>[0]) => Promise<void>;
};

const defaultConfigurationState: ConfigurationState = {
    configurationSaving: false,
    configurationSaveErrors: [],
    configurationLoading: false,
    configurationInitialised: false,
    configurationErrors: [],
    configuration: {},
};

export const useConfiguration = create<ConfigurationStore>(set => {
    const _getConfiguration: ConfigurationStore['getConfiguration'] = async () => {
        const configurationErrors: string[] = [];
        try {
            set({ configurationLoading: true, });
            const res = await getConfiguration();
            set({
                configurationErrors: res.errors || [],
                configuration: res.data,
            });
        } catch(e: any) {
            configurationErrors.push(e.message);
        } finally {
            set({ configurationLoading: false, configurationInitialised: true, configurationErrors, });
        }
    };

    return {
        ...defaultConfigurationState,

        getConfiguration: _getConfiguration,

        async saveConfiguration(data) {
            const configurationSaveErrors: string[] = [];
            try {
                set({ configurationSaving: true, });
                await saveConfiguration(data);
                await _getConfiguration();
            } catch(e: any) {
                configurationSaveErrors.push(e.message);
            } finally {
                set({ configurationSaving: false, configurationSaveErrors, });
            }
        },
    };
});
