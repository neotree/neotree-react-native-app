import Constants from 'expo-constants';

import { Preferences } from '../types';

export const expoContantsExtra = {
    ...Constants.expoConfig?.extra,
} as { [key: string]: any; };

export const APP_CONFIG = expoContantsExtra;
export const countries = (expoContantsExtra.countries || []) as { name: string; iso: string; }[];
export const APP_ENV: string = expoContantsExtra.APP_ENV;
export const APP_VERSION: string = Constants.expoConfig?.version!;
export const SDK_VERSION: string = Constants.expoConfig?.sdkVersion!;

export const defaultPreferences = { 
    fontSize: {}, 
    fontWeight: {}, 
    fontStyle: {}, 
    textColor: {}, 
    backgroundColor: {}, 
    highlight: {},
} as Preferences;

export const fieldsTypes = {
    DATE: 'date',
    DATETIME: 'datetime',
    DROPDOWN: 'dropdown',
    NUMBER: 'number',
    PERIOD: 'period',
    TEXT: 'text',
    TIME: 'time'
};

export const screenTypes = {
    ZW_EDLIZ_SUMMARY_TABLE: 'zw_edliz_summary_table',
    MWI_EDLIZ_SUMMARY_TABLE: 'mwi_edliz_summary_table',
    DIAGNOSIS: 'diagnosis',
    CHECKLIST: 'checklist',
    FORM: 'form',
    LIST: 'list',
    MANAGEMENT: 'management',
    MULTI_SELECT: 'multi_select',
    PROGRESS: 'progress',
    SINGLE_SELECT: 'single_select',
    TIMER: 'timer',
    YESNO: 'yesno',
};

export const DefaultValueType = {
    COMPUTE: 'compute',
    DATE_NOW: 'date_now',
    DATE_NOON: 'date_noon',
    DATE_MIDNIGHT: 'date_midnight',
    EMPTY: '',
    UID: 'uid'
};
  