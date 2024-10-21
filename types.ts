export type DataResponse<T = any> = {
    data: T;
    errors?: string[];
};

export type Site = {
    countryISO: string;
    countryName: string;
    webeditorURL: string;
    apiKey: string;
    savePollingData: boolean;
};

export type Config = {
    NEOTREE_BUILD_TYPE: "production" | "stage" | "development" | "demo";
    sites: Site[];
    eas: {
        projectId: string;
    };
    router: {
        origin: boolean;
    };
};

export type Preferences = {
    fontSize: { [key: string]: undefined | 'default' | 'xs' | 'sm' | 'lg' | 'xl'; };
    fontWeight: { [key: string]: undefined | 'bold'; };
    fontStyle: { [key: string]: undefined | string[]; };
    textColor: { [key: string]: undefined | string; };
    backgroundColor: { [key: string]: undefined | string; };
    highlight: { [key: string]: undefined | boolean; };
};

export type ScriptItem = {
    id: string;
    label: string;
    position: number;
    itemId: string;
    subType: string;
    type: string;
};

export type ScriptField = {
    fieldId: string;
    type: string;
    key: string;
    label: string;
    refKey: string;
    calculation: string;
    condition: string;
    dataType: string;
    defaultValue: string;
    format: string;
    minValue: string;
    maxValue: string;
    minDate: string;
    maxDate: string;
    minTime: string;
    maxTime: string;
    minDateKey: string;
    maxDateKey: string;
    minTimeKey: string;
    maxTimeKey: string;
    values: string;
    confidential: boolean;
    optional: boolean;
    printable: boolean;
    prePopulate: string[];
};

export type DiagnosisSymptom = {
    expression: string;
    name: string;
    weight: number | null;
    type: string;
    position: number;
    symptomId: string;
    printable: boolean;
};

export type ScriptImage = {
    data: string;
    fileId?: string;
    filename?: string;
    size?: number;
    contentType?: string;
};

export type ImageTextField = {
    title: string;
    text: string;
    image: string | {
        data: string;
        fileId?: string;
        filename?: string;
        size?: number;
        type?: string;
    };
};

export type Hospital = {
    id: number;
    hospitalId: string;
    oldHospitalId: string | null;
    name: string;
    country: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type EditorInfo = {
    id: number;
    dataVersion: number;
    lastPublishDate: string | null;
};

export type DeviceDetails = {

};

export type Device = {
    id: number;
    deviceId: string;
    deviceHash: string;
    details: DeviceDetails;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type ConfigKey = {
    id: number;
    configKeyId: string;
    oldConfigKeyId: string | null;
    position: number;
    version: number;
    key: string;
    label: string;
    summary: string;
    source: string | null;
    preferences: Preferences;
    isDraft: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Script = {
    id: number;
    scriptId: string;
    oldScriptId: string | null;
    version: number;
    type: "admission" | "discharge" | "neolab";
    position: number;
    source: string | null;
    title: string;
    printTitle: string;
    description: string;
    hospitalId: string | null;
    exportable: boolean;
    nuidSearchEnabled: boolean;
    nuidSearchFields: any;
    preferences: Preferences;
    isDraft: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Screen = {
    id: number;
    screenId: string;
    oldScreenId: string | null;
    oldScriptId: string | null;
    version: number;
    scriptId: string;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "zw_edliz_summary_table" | "mwi_edliz_summary_table";
    position: number;
    source: string | null;
    sectionTitle: string;
    previewTitle: string;
    previewPrintTitle: string;
    condition: string;
    epicId: string;
    storyId: string;
    refId: string;
    refKey: string;
    step: string;
    actionText: string;
    contentText: string;
    infoText: string;
    title: string;
    title1: string;
    title2: string;
    title3: string;
    title4: string;
    text1: string;
    text2: string;
    text3: string;
    image1: ImageTextField | null;
    image2: ImageTextField | null;
    image3: ImageTextField | null;
    instructions: string;
    instructions2: string;
    instructions3: string;
    instructions4: string;
    hcwDiagnosesInstructions: string;
    suggestedDiagnosesInstructions: string;
    notes: string;
    dataType: string;
    key: string;
    label: string;
    negativeLabel: string;
    positiveLabel: string;
    timerValue: number | null;
    multiplier: number | null;
    minValue: number | null;
    maxValue: number | null;
    exportable: boolean;
    printable: boolean;
    skippable: boolean;
    confidential: boolean;
    prePopulate: string[];
    fields: ScriptField[];
    items: ScriptItem[];
    preferences: Preferences;
    isDraft: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type Diagnosis = {
    id: number;
    diagnosisId: string;
    oldDiagnosisId: string | null;
    oldScriptId: string | null;
    version: number;
    scriptId: string;
    position: number;
    source: string | null;
    expression: string;
    name: string;
    description: string;
    key: string | null;
    severityOrder: number | null;
    expressionMeaning: string;
    symptoms: DiagnosisSymptom[];
    text1: string;
    text2: string;
    text3: string;
    image1: ImageTextField | null;
    image2: ImageTextField | null;
    image3: ImageTextField | null;
    preferences: Preferences;
    isDraft: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

export type RemoteData = {
    newData: boolean;
    deviceId: string;
    deviceHash: string;
    deviceScriptsCount: number;
    dataVersion: number;
    lastPublishDate: Date;
    latestChangesDate: Date;
    scripts: (Script & {
        isDraft: boolean;
        isDeleted: boolean;
        screens: (Screen & {
            isDraft: boolean;
            isDeleted: boolean;
        })[];
        diagnoses: (Diagnosis & {
            isDraft: boolean;
            isDeleted: boolean;
        })[];
    })[];
    configKeys: (ConfigKey & {
        isDraft: boolean;
        isDeleted: boolean;
    })[];
}

export type GetScriptsOptions = {
    scriptsIds?: string[];
};

export type ScriptListItem = {
    type: Script['type'],
    title: string;
    description: string;
    isDraft: boolean;
    scriptId: string;
};