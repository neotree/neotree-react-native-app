export type QueryFilter = {
    order?: [string[]];
    script_id?: string;
};

export type ScriptFields = {
    screen_id: string;
    script_id: string;
    screen_type: string;
    keys: string[];
};

export type Application = {
    id: number;
    version: string;
    device_id: string;
    uid_prefix: string;
    mode: string;
    last_sync_date: Date;
    total_sessions_recorded: number;
    webeditor_info: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ScriptData = {
    description: string,
    id: number;
    position: number;
    scriptId: string;
    title: string;
    type: 'admission' | 'discharge' | null;
    script_id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
};

export type ScriptRow = {
    id: number;
    script_id: string;
    type: string;
    position: number;
    data: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Script = Omit<ScriptRow, 'data'> & {
    data: ScriptData;
};

export type ScreenMetadataField = {
    confidential: boolean;
    dataType: string;
    key: string;
    label: string;
    maxValue: string;
    minValue: string;
    optional: boolean;
    position: number;
    type: string;
    values: string;
    format: string;
};

export type ScreenMetadataItem = {
    confidential: boolean;
    dataType: string;
    id: string;
    label: string;
    position: number;
    exclusive: boolean;
};

export type ScreenMetadataImage = { data: string; };

export type ScreenMetadata = {	
    title1?: string;
    title2?: string;
    title3?: string;
    text1?: string;
    text2?: string;
    text3?: string;
    image1?: ScreenMetadataImage;
    image2?: ScreenMetadataImage;
    image3?: ScreenMetadataImage;
    confidential: boolean;
    dataType: string;
    key: string;
    label: string;
    negativeLabel: string;
    positiveLabel: string;
    multiplier: number;
    timerValue: string;
    items: ScreenMetadataItem[];
    fields: ScreenMetadataField[];
};

export type ScreenData = {
    actionText: string;
    contentText: string;
    epicId: string;
    id: number;
    infoText: string;
    order: number;
    position: number;
    refId: string;
    screenId: string;
    scriptId: string;
    sectionTitle: string;
    source: string;
    step: string;
    storyId: string;
    title: string;
    type: string;
    screen_id: string;
    script_id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    metadata: ScreenMetadata;
};

export type ScreenRow = {
    id: number;
    script_id: string;
    screen_id: string;
    type: string;
    position: number;
    data: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Screen = Omit<ScreenRow, 'data'> & {
    data: ScreenData;
};

export type DiagnosisData = {
    description: string;
    diagnosisId: string;
    expression: string;
    name: string;
    scriptId: string;
    source: string;
    position: number;
    image1: { data: string; };
    image2: { data: string; };
    image3: { data: string; };
    text1: string;
    text2: string;
    text3: string;
    diagnosis_id: string;
    script_id: string;
    expressionMeaning: string;
    id: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    symptoms: ({
        expression: string;
        name: string;
        type: string;
        weight: string;
    })[];
};

export type DiagnosisRow = {
    id: number;
    script_id: string;
    diagnosis_id: string;
    type: string;
    position: number;
    data: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Diagnosis = Omit<DiagnosisRow, 'data'> & {
    data: DiagnosisData;
};

export type Session = {
    id: number;
    session_id: number;
    script_id: string;
    type: string;
    uid: string;
    data: string;
    completed: boolean;
    exported: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type Export = {
    id: number;
    session_id: number;
    scriptid: string;
    uid: string;
    data: string;
    ingested_at: Date;
};

export type AuthenticatedUser = {
    apiKey: string;
    createdAt: number;
    displayName: string | null;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    lastLoginAt: number;
    phoneNumber: number | null;
    photoURL: string | null;
    providerData: {
        displayName: string | null
        email: string;
        phoneNumber: string | null;
        photoURL: string | null;
        providerId: string;
        uid: string;
    },
    redirectEventId: string | null;
    stsTokenManager: {
      accessToken: string;
      apiKey: string;
      expirationTime: number;
      refreshToken: string;
    },
    tenantId: string | number | null;
    uid: string;
};

export type AuthenticatedUserRow = {
    id: number;
    authenticated: boolean;
    details: string;
};

export type ConfigKeyData = {
    configKey: string;
    configKeyId: string;
    label: string;
    source: string;
    summary: string;
    position: number;
    id: number;
    config_key_id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
};

export type ConfigKeyRow = {
    id: number;
    config_key_id: string;
    position: number;
    data: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ConfigKey = Omit<ConfigKeyRow, 'data'> & {
    data: ConfigKeyData;
};

export type Configuration = {
    id: number;
    data: { [configKeyId: string | number]: boolean; };
    createdAt: Date;
    updatedAt: Date;
};

export type Location = {
    id: number;
    country: string;
    hospital: string;
};
