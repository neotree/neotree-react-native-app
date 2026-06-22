import { RouteProp, ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export * from '../config/types';

export type ApkReleaseStatus =
  | 'uploaded'
  | 'validated'
  | 'approved'
  | 'available'
  | 'deprecated'
  | 'revoked'
  | 'rolled_back';

export type ApkInstallWindow = 'on_restart' | 'idle' | 'immediate';
export type ApkDeliveryMode = 'in_app' | 'mdm' | 'hybrid' | 'manual';
export type UpdateChannel = 'demo' | 'stage' | 'prod' | 'production';

export type UpdatePolicyApkRelease = {
  apkReleaseId: string;
  runtimeVersion: string;
  versionName: string;
  versionCode: number;
  status: ApkReleaseStatus;
  isAvailable: boolean;
  available: boolean;
  fileId: string | null;
  fileSize?: number | null;
  checksumSha256?: string | null;
  signatureSha256?: string | null;
  validatedAt?: string | null;
  approvedAt?: string | null;
  releaseNotes?: string | null;
  releasedAt?: string | null;
  downloadUrl?: string | null;
  isDowngrade?: boolean;
};

export type UpdatePolicy = {
  runtimeVersion: string;
  policyVersion: number;
  ota: {
    enabled: boolean;
    channel: UpdateChannel | string;
  };
  apk: {
    deliveryMode?: ApkDeliveryMode | string | null;
    autoDownload: boolean;
    forceInstall: boolean;
    wifiOnly?: boolean | null;
    healthCheckHours?: number | null;
    gracePeriodHours?: number | null;
    forceAfter?: string | null;
    installWindow?: ApkInstallWindow | string | null;
    messageTitle?: string | null;
    messageBody?: string | null;
  };
  targeting?: {
    scope?: 'country' | 'group' | 'hospital' | string | null;
    groupId?: string | null;
    hospitalId?: string | null;
  };
  rollback?: {
    enabled?: boolean;
  };
  currentApkRelease?: UpdatePolicyApkRelease | null;
  rollbackApkRelease?: UpdatePolicyApkRelease | null;
};

export type UpdatePolicyResponse = {
  data: UpdatePolicy | null;
  errors?: string[];
  /** HTTP status of the policy fetch, used to distinguish 404 (no policy) from transient errors. */
  status?: number;
  /** True when the request was deliberately not made (e.g. device secret not yet provisioned). */
  skipped?: boolean;
};

export type Preferences = {
    fontSize: { [key: string]: undefined | 'default' | 'xs' | 'sm' | 'lg' | 'xl'; };
    fontWeight: { [key: string]: undefined | 'bold'; };
    fontStyle: { [key: string]: undefined | string[]; };
    textColor: { [key: string]: undefined | string; };
    backgroundColor: { [key: string]: undefined | string; };
    highlight: { [key: string]: undefined | boolean; };
    enableSeverityRanking?: boolean;
};

export type Location = {
  id: number;
  country: string;
  hospital?: string;
};

export type Facility = { label: string; value: string; other?: string; };

export type NuidSearchResults = {
    session: any;
    uid: string;
    searchedUid?: string;
    autoFill?: any;
    prePopulateWithUID?: boolean;
    continueWithoutPrePopulation?: boolean;
    useSearchedUidForSession?: boolean;
};

export type NuidSearchFormField = {
    results: null | NuidSearchResults;
    key: string;
    value: any;
    type: string;
    condition: string;
};

export type MatchedSession = {
	session: any,
	uid: string;
	searchedUid?: string;
	// facility: Facility;
	autoFill?: any;
	prePopulateWithUID?: boolean;
	continueWithoutPrePopulation?: boolean;
	useSearchedUidForSession?: boolean;
    // fields: ({
    //     key: string;
    //     value: string;
    // })[]
};

export type AuthenticatedUser = any;

export type Application = {
  device_id: string;
  last_sync_date: null | string;
  mode: 'production' | 'development';
  total_sessions_recorded: number;
  uid_prefix: string;
  version: string;
  webeditor_info: {
    last_backup_date: boolean;
    should_track_usage: boolean;
    version: number;
  };
};
export type Exception = {
  id: number,
  device: string;
  message:string;
  hospital: string;
  stack: string;
  exported: boolean;
  version: string;
  editor_version: string;
  battery: string;
  memory: string;
  device_model: string;
};

export type Script = any;
export type Screen = any;
export type Diagnosis = any;
export type Problem = any;
export type ConfigKey = any;
export type Configuration = any;
export type Repeatable=any;
export type Alias=any;

export type DischargeDiagnosis = Record<string, {
  Priority: number;
  Suggested: boolean;
  diagnosis: string;
  value?: string;
  hcw_agree: string;
  hcw_reason_given: null | string;
  hcw_follow_instructions: null | string;
}>;

export type DischargeProblem = Record<string, {
  Priority: number;
  Suggested: boolean;
  problem: string;
  value?: string;
  hcw_agree: string;
  hcw_reason_given: null | string;
  hcw_follow_instructions: null | string;
}>;

export type DrugField = {
  key: string;
  position: number;
};

export type DrugsLibraryItem = {
  id: number;
  type: 'drug' | 'fluid' | 'feed';
  itemId: string;
  key: string;
  drug: string;
  minGestation: number | null;
  maxGestation: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  minAge: number | null;
  maxAge: number | null;
  dosage: number | null;
  dosageMultiplier: number | null;
  hourlyFeed: number | null;
  hourlyFeedDivider: number | null;
  hourlyDosage: number | null;
  dayOfLife: string;
  dosageText: string;
  managementText: string;
  gestationKey: string;
  weightKey: string;
  diagnosisKey: string;
  ageKey: string;
  administrationFrequency: string;
  drugUnit: string;
  routeOfAdministration: string;
  position: number;
  condition: string;
  calculator_condition: string;
  validationType: 'default' | 'condition';
  version: number;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Hospital = {
	id: number;
	hospital_id: string;
	name: string;
	country: string;
};

export type ScreenEntryValue = {
  value?: any;
  value2?: any;
  key2?: any;
  valueText?: any;
  valueLabel?: any;
  unit?: string;
  label?: string;
  key?: string;
  parentKey?: string;
  inputKey?: string;
  type?: string;
  dataType?: string;
  confidential?: boolean;
  exportValue?: any;
  exportLabel?: any;
  exportType?: any;
  calculateValue?: any;
  exclusive?: any;
  error?: any;
  diagnosis?: Diagnosis;
  problem?: Problem;
  prePopulate?: any[];
  printable?: boolean;
  printDisplayColumns?: 1 | 2;
  extraLabels?: string[] | {
    title?: string;
    label: string;
    printTitle?: boolean;
  }[];
  selected?: boolean;
  data?: any;
  comments?: { key?: string; label: string; }[];
  listStyle?: 'none' | 'number' | 'bullet';
  score?: number;
};

export type ScreenEntry = {
  value?: ScreenEntryValue[];
  values: ScreenEntryValue[];
  repeatables:  ScreenEntryValue[];
  management: any[];
  screenIndex: number;
  screen: {
    index: number;
    title: string;
    sectionTitle: string;
    id: string | number;
    screen_id: string | number;
    type: string;
    metadata: {
      label: string;
      dataType: string;
    };
  };
  lastSection?: any;
  lastActiveDiagnosisIndex?: any;
};

export type ScreenTypeProps = {
  searchVal: string;
  entry?: ScreenEntry;
  setEntry: (values?: ScreenEntryValue[]) => void;
};

export type ScreenFormTypeProps = {
  field: any;
  entryValue: ScreenEntryValue;
  fieldIndex: number;
  conditionMet: boolean;
  onManualValueChange?: (entry: Partial<ScreenEntryValue>)=>void,
  onChange: (val: Partial<ScreenEntryValue>) => void;
  formValues: ScreenEntry['values'];
  allValues: ScreenEntry['values'];
  repeatable?:boolean,
  editable?:boolean
  formIndex?: number
  onLinkedFieldChange?: (key: string, value: Partial<ScreenEntryValue>) => void;
};

export type DiagnosisSectionProps = ScreenTypeProps & {
	getDefaultDiagnosis: (d?: Diagnosis) => Diagnosis;
	diagnosisToEntryValue: (d?: Diagnosis) => ScreenEntryValue;
	setActiveDiagnosisIndex: React.Dispatch<React.SetStateAction<null | number>>;
	_setHcwDiagnoses: React.Dispatch<React.SetStateAction<ScreenEntryValue[]>>;
  setOrderBySeverity: React.Dispatch<React.SetStateAction<boolean>>;
	setHcwDiagnoses: (diagnoses: Diagnosis[]) => void;
	setDiagnoses: (diagnoses?: Diagnosis[]) => void;
	setMoreNavOptions: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
	diagnoses: Diagnosis[];
	acceptedDiagnoses: Diagnosis[];
  acceptedDiagnosesAndProblems: Diagnosis[];
	activeDiagnosisIndex: null | number;
	hcwDiagnoses: Diagnosis[];
};

export type ProblemSectionProps = ScreenTypeProps & {
	getDefaultProblem: (d?: Problem) => Problem;
	problemToEntryValue: (d?: Problem) => ScreenEntryValue;
	setActiveProblemIndex: React.Dispatch<React.SetStateAction<null | number>>;
	_setHcwProblems: React.Dispatch<React.SetStateAction<ScreenEntryValue[]>>;
  setOrderBySeverity: React.Dispatch<React.SetStateAction<boolean>>;
	setHcwProblems: (problems: Problem[]) => void;
	setProblems: (problems?: Problem[]) => void;
	setMoreNavOptions: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
	problems: Problem[];
	acceptedProblems: Problem[];
  rejectedProblems: Problem[];
	activeProblemIndex: null | number;
	hcwProblems: Problem[];
};

export type RepeatableProps = ScreenTypeProps & {
	getDefaultRepeatables: (r?: Repeatable) => Repeatable;
	repeatableToEntryValue: (d?: Repeatable) => ScreenEntryValue;
	setActiveRepeatableIndex: React.Dispatch<React.SetStateAction<null | number>>;
	setRepeatables: (repeatables?: Repeatable[]) => void;
	setMoreNavOptions: () => void;
	repeatables: Repeatable[];
	activeRepeatableIndex: null | number;
};

export interface StackNavigationProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> {
  navigation: NativeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
}

export type AppRoutes = {
  Authentication: undefined;
  Home: undefined;
};

export type AuthenticationRoutes = {
  Location: undefined;
  Login: undefined;
};

export type HomeRoutes = {
  Home: undefined;
  Script: {
    script_id: string;
    screen_id?: string;
	session?: any;
  };
  Configuration: undefined;
  Updates: undefined;
  Location: undefined;
  Sessions: undefined;
  QrCode: undefined;
};

export type CustomError = {
  message: string;
  stack: string;


}
