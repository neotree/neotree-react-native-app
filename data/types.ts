import { ScriptWithItems } from "@/data/remote-api";

export type * from '@/data/remote-api';

export type Script = Omit<ScriptWithItems, 'screens' | 'diagnoses'>;

export type Screen = ScriptWithItems['screens'][0];

export type Diagnosis = ScriptWithItems['diagnoses'][0];

export type SessionData = {
	script_id: string;
	type: string;
	uid: string;
	unique_key: string;
	app_mode: string;
	country: string;
	hospital_id: string;
	started_at: string;
	completed_at: string | null;
	canceled_at: string | null;
	dateAndTimeOfDeath: string | null,
	management: ScriptWithItems['screens'][0];
	diagnoses: any[];
	matchingSession: any[];
	matched: any[];
	form: any[];
};
