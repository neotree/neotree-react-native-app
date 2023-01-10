import { RouteProp, ParamListBase } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export * from '../config/types';

export type Location = { 
  id: number;
  country: string;
  hospital?: string;
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

export type Script = any;
export type Screen = any;
export type Diagnosis = any;
export type ConfigKey = any;
export type Configuration = any;

export type ScreenEntryValue = {
  value?: any;
  valueText?: any;
  label?: string;
  key?: string;
  type?: string;
  dataType?: string;
  confidential?: boolean;
  calculateValue?: any;
  exclusive?: any;
  error?: any;
  diagnosis?: Diagnosis;
};

export type ScreenEntry = {
  values: ScreenEntryValue[];
  screenIndex: number;
  screen: {
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
  onChange: (val: Partial<ScreenEntryValue>) => void;
  formValues: ScreenEntry['values'];
};

export type DiagnosisSectionProps = ScreenTypeProps & {
  getDefaultDiagnosis: (d?: Diagnosis) => Diagnosis;
  diagnosisToEntryValue: (d?: Diagnosis) => ScreenEntryValue;
  setActiveDiagnosisIndex: React.Dispatch<React.SetStateAction<null | number>>;
  _setHcwDiagnoses: React.Dispatch<React.SetStateAction<ScreenEntryValue[]>>
  setHcwDiagnoses: (diagnoses: Diagnosis[]) => void;
  setDiagnoses: (diagnoses?: Diagnosis[]) => void;
  setMoreNavOptions: () => void;
  diagnoses: Diagnosis[];
  acceptedDiagnoses: Diagnosis[];
  activeDiagnosisIndex: null | number;
  hcwDiagnoses: Diagnosis[];
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
  };
  Configuration: undefined;
  Location: undefined;
  Sessions: undefined;
};
