import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import queryString from 'query-string';

import { API_CONFIG } from "@/constants";

const RemoteDataApi = {
	hospitals() {
		return GET<Hospital[]>(
			'webeditor',
			'/api/hospitals',
			{
				defaultResponseData: [],
			}
		);
	},

	scripts(hospitalId: string) {
		return GET<ScriptWithItems[]>(
			'webeditor',
			'/api/scripts/with-items',
			{
				defaultResponseData: [],
				data: {
					data: JSON.stringify({
						hospitalIds: [hospitalId],
					}),
				},
			}
		);
	},

	configKeys() {
		return GET<ConfigKey[]>(
			'webeditor',
			'/api/config-keys',
			{
				defaultResponseData: [],
			}
		);
	},

	drugsLibrary() {
		return GET<DrugsLibraryItem[]>(
			'webeditor',
			'/api/drugs-library',
			{
				defaultResponseData: [],
			}
		);
	},

	aliases() {
		return GET<Alias[]>(
			'webeditor',
			'/api/aliases',
			{
				defaultResponseData: [],
			}
		);
	},
};

export default RemoteDataApi;

type WebeditorApiResponse<T = any> = {
	data: T;
	errors?: string[]
};

type RequestOptions = {
	data?: Record<string, any>;
	queryParams?: Record<string, any>;
	defaultResponseData: any;
};


async function GET<DataType>(type: 'webeditor' | 'nodeapi', endpoint: string, {
	data,
	queryParams,
	defaultResponseData,
}: RequestOptions) {
	try {
		const axios = await getAxiosClient(type);
		const res = await axios.get(`${endpoint}?${queryString.stringify({ ...data, ...queryParams })}`);
		return res.data as WebeditorApiResponse<DataType>;
	} catch(e: any) {
		return {
			data: defaultResponseData as DataType,
			errors: [`${e.message}`],
		};
	}
}

async function POST<DataType>(type: 'webeditor' | 'nodeapi', endpoint: string, {
	data,
	queryParams,
	defaultResponseData,
}: RequestOptions) {
	try {
		const axios = await getAxiosClient(type);
		const res = await axios.post(`${endpoint}?${queryString.stringify({ ...queryParams })}`, data);
		return res.data as WebeditorApiResponse<DataType>;
	} catch(e: any) {
		return {
			data: defaultResponseData as DataType,
			errors: [`${e.message}`],
		};
	}
}

async function getAxiosClient(type: 'webeditor' | 'nodeapi') {
	const country = await SecureStore.getItemAsync('country');

	if (!country) throw new Error('Country not set');

	const { host, api_key, } = API_CONFIG[country][type];

	const axiosClient = axios.create({
		baseURL: host,
	});

	axiosClient.interceptors.request.use(async config => {
		if (process.env.NODE_ENV === 'development') {
			console.log(`[${config.method}]: ${config.baseURL}${config.url}`);
		}

		if (config.headers) {
			config.headers['x-api-key'] = api_key;
		}
		return config;
	});

	axiosClient.interceptors.response.use(
		res => res,
		e => new Promise((_, reject) => {
			return reject(e);
		}),
	);

	return axiosClient;
};

export type ScriptWithItems = Script & {
	screens: Screen[];
	diagnoses: Diagnosis[];
};

export type Preferences = {
    fontSize: { [key: string]: undefined | 'default' | 'xs' | 'sm' | 'lg' | 'xl'; };
    fontWeight: { [key: string]: undefined | 'bold'; };
    fontStyle: { [key: string]: undefined | string[]; };
    textColor: { [key: string]: undefined | string; };
    backgroundColor: { [key: string]: undefined | string; };
    highlight: { [key: string]: undefined | boolean; };
};

export type PrintSection = {
    sectionId: string;
    title: string;
    screensIds: string[];
};

export type DrugLibraryItemField = {
    key: string;
    keyId?: string;
    position: number;
};

export type ScriptItem = {
    id: string;
    label: string;
    position: number;
    itemId: string;
    subType: string;
    type: string;
    exclusive: boolean;
    confidential: boolean;
    checked: boolean;
    enterValueManually?: boolean;
    severity_order: string;
    summary: string;
    key: string;
    keyId?: string;
    dataType: null | string;
    score: null | number;
};

export type ScriptField = {
    fieldId: string;
    type: string;
    key: string;
    keyId?: string;
    label: string;
    refKey: string;
    refKeyId?: string;
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
    minDateKeyId?: string;
    maxDateKeyId?: string;
    minTimeKeyId?: string;
    maxTimeKeyId?: string;
    values: string;
    valuesOptions: {
        key: string;
        optionKey: string;
        optionLabel: string;
    }[];
    confidential: boolean;
    optional: boolean;
    printable: boolean;
    prePopulate: string[];
    editable: boolean;
    items?: {
        itemId: string;
        value: string | number;
        label: string | number;
        label2?: string;
        exclusive?: boolean;
        enterValueManually?: boolean;
        keyId?: string;
    }[];
};

export type DiagnosisSymptom = {
    expression: string;
    key?: string;
    keyId?: string;
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

export type ScreenReviewField = {
    label: string;
    screen:string;
 }

 export type Alias = {
    value: string;
    key: string;
 }

export type Pagination = {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

export type ScriptPrintConfig = {
	headerFormat?: string
	headerFields: string[]
	footerFields: string[]
	sections: any[]
};

export type Hospital = {
    id: number;
    hospitalId: string;
    oldHospitalId: string | null;
    name: string;
    country: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DrugsLibraryItem = {
    id: number;
    itemId: string;
    key: string;
    keyId: string;
    type: "drug" | "fluid" | "feed";
    drug: string;
    minGestation: number | null;
    maxGestation: number | null;
    minWeight: number | null;
    maxWeight: number | null;
    minAge: number | null;
    maxAge: number | null;
    hourlyFeed: number | null;
    hourlyFeedDivider: number | null;
    dosage: number | null;
    dosageMultiplier: number | null;
    dayOfLife: string;
    dosageText: string;
    managementText: string;
    gestationKey: string;
    weightKey: string;
    diagnosisKey: string;
    ageKey: string;
    ageKeyId: string;
    gestationKeyId: string;
    weightKeyId: string;
    diagnosisKeyId: string;
    administrationFrequency: string;
    drugUnit: string;
    routeOfAdministration: string;
    position: number;
    condition: string;
    calculator_condition: string;
    validationType: ("default" | "condition") | null;
    version: number;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
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
    preferences: any;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type Script = {
    id: number;
    scriptId: string;
    oldScriptId: string | null;
    version: number;
    type: "admission" | "discharge" | "neolab" | "drecord" | "dff_calculator";
    position: number;
    source: string | null;
    title: string;
    printTitle: string;
    description: string;
    hospitalId: string | null;
    exportable: boolean;
    nuidSearchEnabled: boolean;
    nuidSearchFields: ScriptField[];
    reviewable: boolean;
    reviewConfigurations: ScreenReviewField;
    preferences: Preferences;
    printConfig: ScriptPrintConfig;
    printSections: PrintSection[];
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type Screen = {
    id: number;
    screenId: string;
    oldScreenId: string | null;
    oldScriptId: string | null;
    version: number;
    scriptId: string;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "drugs" | "fluids" | "feeds" | "zw_edliz_summary_table" | "mwi_edliz_summary_table" | "edliz_summary_table" | "dynamic_form";
    position: number;
    source: string | null;
    sectionTitle: string;
    previewTitle: string;
    previewPrintTitle: string;
    condition: string;
    skipToCondition: string;
    skipToScreenId: string | null;
    epicId: string;
    storyId: string;
    refId: string;
    refIdDataKey: string;
    refKey: string;
    refKeyDataKey: string;
    step: string;
    actionText: string;
    contentText: string;
    contentTextImage: ScriptImage | null;
    infoText: string;
    title: string;
    title1: string;
    title2: string;
    title3: string;
    title4: string;
    text1: string;
    text2: string;
    text3: string;
    image1: ScriptImage | null;
    image2: ScriptImage | null;
    image3: ScriptImage | null;
    instructions: string;
    instructions2: string;
    instructions3: string;
    instructions4: string;
    hcwDiagnosesInstructions: string;
    suggestedDiagnosesInstructions: string;
    notes: string;
    dataType: string;
    key: string;
    keyId: string;
    label: string;
    negativeLabel: string;
    positiveLabel: string;
    timerValue: number | null;
    multiplier: number | null;
    minValue: number | null;
    maxValue: number | null;
    exportable: boolean;
    printable: boolean | null;
    skippable: boolean;
    confidential: boolean;
    prePopulate: string[];
    fields: ScriptField[];
    items: ScriptItem[];
    preferences: Preferences;
    drugs: DrugsLibraryItem[];
    fluids: DrugsLibraryItem[];
    feeds: DrugsLibraryItem[];
    reasons: { key: string; value: string }[];
    listStyle: "none" | "number" | "bullet";
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    collectionName: string;
    collectionLabel: string;
    repeatable: boolean | null;
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
    keyId: string;
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
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
